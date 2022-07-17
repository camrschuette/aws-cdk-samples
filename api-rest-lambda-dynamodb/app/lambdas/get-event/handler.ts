import middy from '@middy/core';
import * as lambda from 'aws-lambda';
import {cleanEnv, str} from 'envalid';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import * as createError from 'http-errors';
import {MiddyErrorHandler} from '../../shared/error-handler';
import {isZodError, zodErrorHandler} from '../../shared/zod';
import {httpErrorHandler} from '../../shared/http-errors';
import {GetEventPathParameters} from "./models";
import {DbEventSchema, DbParticipantSchema} from "../../shared/dao";

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['production', 'development', 'test']
    }),
    EVENTS_TABLE_NAME: str({}),
});

const errorMiddleware = new MiddyErrorHandler()
    .register(isZodError, zodErrorHandler)
    .register(createError.isHttpError, httpErrorHandler);

const ddbClient = new DynamoDB({});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

async function lambdaHandler(event: lambda.APIGatewayProxyEventV2): Promise<lambda.APIGatewayProxyStructuredResultV2> {
    const pathParams = await GetEventPathParameters.parseAsync(event.pathParameters);

    // Probably should make a recursive function to
    // get all keys, but this will work for now.
    const queryEvent = await ddbDocClient.query({
        TableName: env.EVENTS_TABLE_NAME,
        ExpressionAttributeValues: {
            ':p': `EVENT#${pathParams.id}`
        },
        KeyConditionExpression: 'pk = :p',
    });

    if (!queryEvent.Items) {
        throw createError(404, 'No event found with id');
    }

    const dbEvent = (await Promise.all(queryEvent.Items.filter((i) => ('key' in i))
        .map(async (i) => (DbEventSchema.parseAsync(i)))))
        .pop();

    if (!dbEvent) {
        throw createError(404, 'No event found with id');
    }

    const dbParticipants = await Promise.all(queryEvent.Items.filter((i) => ('age' in i))
        .map(async (i) => (DbParticipantSchema.parseAsync(i))));

    return {
        statusCode: 200,
        body: JSON.stringify({
            id: dbEvent.pk,
            participants: dbParticipants.map((p) => {
                return {
                    age: p.age,
                    firstName: p.sk.split('#')[0],
                    lastName: p.sk.split('#')[1]
                };
            }),
            scheduledDate: dbEvent.scheduledDate
        })
    }
}

export const handler = middy(lambdaHandler)
    .use(errorMiddleware.middleware);
