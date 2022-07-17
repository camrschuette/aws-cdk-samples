import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import {HttpLambdaIntegration} from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import {Stack, StackProps} from 'aws-cdk-lib';
import {CfnStage} from 'aws-cdk-lib/aws-apigatewayv2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import {Construct} from 'constructs';
import {join} from 'path'

export class ApiRestLambdaDynamodbStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        //region DynamoDB
        const eventsTable = new dynamodb.Table(this, 'EventsTable', {
            partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING }
        });
        //endregion

        //region Lambdas
        const commonNodeJsFunctionProps: nodejs.NodejsFunctionProps = {
            awsSdkConnectionReuse: true,
            bundling: {
                externalModules: [
                    'aws-lambda',
                    'aws-sdk',
                ],
            },
            depsLockFilePath: join(__dirname, '..', 'package-lock.json'),
            runtime: lambda.Runtime.NODEJS_16_X
        };

        const createEventFunction = new nodejs.NodejsFunction(this, 'CreateEventFunction', {
            entry: join(__dirname, '..', 'app', 'lambdas', 'create-event', 'handler.ts'),
            environment: {
                NODE_ENV: 'testing',
                DDB_TABLE: eventsTable.tableName
            },
            ...commonNodeJsFunctionProps
        });

        const getEventFunction = new nodejs.NodejsFunction(this, 'GetEventFunction', {
            entry: join(__dirname, '..', 'app', 'lambdas', 'get-event', 'handler.ts'),
            environment: {
                NODE_ENV: 'testing',
                DDB_TABLE: eventsTable.tableName
            },
            ...commonNodeJsFunctionProps
        });
        //endregion

        //region Grant DynamoDB access to lambdas
        eventsTable.grantWriteData(createEventFunction);
        eventsTable.grantReadData(getEventFunction);
        //endregion

        //region Lambda integrations
        const createEventIntegration = new HttpLambdaIntegration('CreateEventIntegration', createEventFunction, {
            payloadFormatVersion: apigwv2.PayloadFormatVersion.VERSION_2_0
        });
        const getEventIntegration = new HttpLambdaIntegration('GetEventIntegration', getEventFunction, {
            payloadFormatVersion: apigwv2.PayloadFormatVersion.VERSION_2_0
        });
        //endregion

        //region API Gateway
        const api = new apigwv2.HttpApi(this, 'HttpApi');

        api.addRoutes({
            path: '/events',
            methods: [ apigwv2.HttpMethod.POST ],
            integration: createEventIntegration,
        });

        api.addRoutes({
            path: '/events/{id}',
            methods: [ apigwv2.HttpMethod.GET ],
            integration: getEventIntegration,
        });
        //endregion

        //region Access logs
        const accessLog = new logs.LogGroup(this, 'AccessLogGroup', {
            retention: logs.RetentionDays.ONE_WEEK
        });
        const stage = api.defaultStage?.node.defaultChild as CfnStage;
        stage.accessLogSettings = {
            destinationArn: accessLog.logGroupArn,
            format: JSON.stringify({
                requestId: '$context.requestId',
                userAgent: '$context.identity.userAgent',
                sourceIp: '$context.identity.sourceIp',
                requestTime: '$context.requestTime',
                requestTimeEpoch: '$context.requestTimeEpoch',
                httpMethod: '$context.httpMethod',
                path: '$context.path',
                status: '$context.status',
                protocol: '$context.protocol',
                responseLength: '$context.responseLength',
                domainName: '$context.domainName'
            })
        };
        //endregion
    }
}
