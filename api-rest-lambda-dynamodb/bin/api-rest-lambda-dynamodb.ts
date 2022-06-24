#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiRestLambdaDynamodbStack } from '../lib/api-rest-lambda-dynamodb-stack';

const app = new cdk.App();
new ApiRestLambdaDynamodbStack(app, 'ApiRestLambdaDynamodbStack', {});
