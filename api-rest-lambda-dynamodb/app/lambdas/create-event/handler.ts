import middy from '@middy/core';
import * as lambda from 'aws-lambda';
import {cleanEnv, str, url} from 'envalid';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {CreateEventRequestSchema} from './models';
import * as createError from 'http-errors';
import {MiddyErrorHandler} from '../../shared/error-handler';
import {isZodError, zodErrorHandler} from '../../shared/zod';
import {httpErrorHandler} from '../../shared/http-errors';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['production', 'development', 'test']
    }),
    EVENTS_TABLE_NAME: str({}),
    BORED_API_BASE_URL: url({
        default: 'http://www.boredapi.com/api/'
    })
});

const errorMiddleware = new MiddyErrorHandler()
    .register(isZodError, zodErrorHandler)
    .register(createError.isHttpError, httpErrorHandler);

const axiosInstance = axios.create({
    baseURL: env.BORED_API_BASE_URL,
    timeout: 1000,
});
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

    const resp = await axiosInstance.get('/activity', {
        params: { key: `${request.activityKey}` }
    });

    if (resp.data.err) {
        throw createError(404, `No activity found for key ${request.activityKey}`);
    } else if (resp.data.participants !== request.participants.length) {
        throw createError(400, 'Number of participants does not match');
    }

    const eventId = uuidv4().replace(/-/g, '');
    await ddbDocClient.batchWrite({
        RequestItems: {
            [env.EVENTS_TABLE_NAME]: [{
                PutRequest: {
                    Item: {
                        pk: `EVENT#${eventId}`,
                        sk: `PROFILE`,
                        key: `${request.activityKey}`,
                        scheduledDate: request.startDate.toISOString()
                    }
                }
            },
            ...request.participants.map((p) => ({
                PutRequest: {
                    Item: {
                        pk: `EVENT#${eventId}`,
                        sk: `PARTICIPANT#${p.firstName}#${p.lastName}`,
                        age: p.age
                    }
                }
            }))]
        }
    });

    return {
        statusCode: 201,
        body: JSON.stringify({ id: eventId })
    }
}

export const handler = middy(lambdaHandler)
    .use(errorMiddleware.middleware);
