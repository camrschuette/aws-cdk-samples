import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import {Construct} from 'constructs';

export class StepfunctionUserValidationStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //#region Lambdas
        const checkAddressLambda = new lambda.NodejsFunction(this, 'CheckAddressLambda', {

        });
        //#endregion

        //#region Step function definitions

        // Create state machine
        const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
            definition: definition,
            timeout: cdk.Duration.minutes(5),
        });

        // Grant lambda execution roles
        //#endregion
    }
}
