import middy from '@middy/core';
import * as lambda from 'aws-lambda';
import {cleanEnv, str} from 'envalid';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {CreateEventRequestSchema} from './models';
import * as createError from 'http-errors';
import {MiddyErrorHandler} from '../../shared/error-handler';
import {isHttpError} from 'http-errors';
import {isZodError, zodErrorHandler} from '../../shared/zod';
import {httpErrorHandler} from '../../shared/http-errors';

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['production', 'testing', 'development']
    }),
    DDB_TABLE: str({})
});

const errorMiddleware = new MiddyErrorHandler()
    .register(isZodError, zodErrorHandler)
    .register(isHttpError, httpErrorHandler);

const ddbClient = new DynamoDB({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

async function lambdaHandler(event: lambda.APIGatewayProxyEventV2): Promise<lambda.APIGatewayProxyStructuredResultV2> {
    if (event.body === undefined) {
        throw createError(400, 'Missing request body');
    }
    
    let json;
    try {
        json = JSON.parse(event.body);
    } catch (err) {
        throw createError(415, 'Unsupported media type');
    }
    
    const request = await CreateEventRequestSchema.parseAsync(json);
    
    await ddbDocClient.put({
        TableName: env.DDB_TABLE,
        Item: {
            pk: '',
            sk: ''
        }
    });
    
    return {
        statusCode: 201,
        body: `Hello from ${event.rawPath}`
    }
}

export const handler = middy(lambdaHandler)
    .use(errorMiddleware.middleware);
