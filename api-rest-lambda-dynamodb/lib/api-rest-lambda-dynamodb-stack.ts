import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import {HttpLambdaIntegration} from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import {Stack, StackProps} from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from 'constructs';

export class ApiRestLambdaDynamodbStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        
        const table = new dynamodb.Table(this, 'EventsTable', {
            partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING }
        });

        const api = new apigwv2.HttpApi(this, 'HttpApi');

        api.addRoutes({
            path: '/events',
            methods: [ apigwv2.HttpMethod.POST ],
            integration: new HttpLambdaIntegration('CreateEventsIntegration', undefined, {
                payloadFormatVersion: apigwv2.PayloadFormatVersion.VERSION_2_0
            }),
        });
    }
}
