import middy from '@middy/core';
import * as lambda from 'aws-lambda';
import { cleanEnv, str } from 'envalid';

const env = cleanEnv(process.env, {
    DDB_TABLE: str({})
});

async function lambdaHandler(event: lambda.APIGatewayProxyEventV2): Promise<lambda.APIGatewayProxyStructuredResultV2> {
    return {
        statusCode: 200,
        body: `Hello from ${event.rawPath}`
    }
}

export const handler = middy(lambdaHandler);
