#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RestApiStack } from '../lib/rest_api-stack';

const app = new cdk.App();

const props = {
  org: 'enrique',
  enviroment: 'dev',
  env:{
      region: 'us-east-1',
  account: '913008941063'
  },
}



new RestApiStack(app, 'RestApiStack', props);