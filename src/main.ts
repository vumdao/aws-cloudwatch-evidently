import { App } from 'aws-cdk-lib';
import { AmplifyConsoleReactStack } from './amplify-console';
import { CloudwatchEvidentlyStack } from './evidently';
import { devEnv } from './shared/environment';
import { TagsProp } from './shared/tagging';

const app = new App();

new CloudwatchEvidentlyStack(app, 'CloudwatchEvidentlyStack', devEnv, {
  description: 'Cloudwatch Evidently demo',
  env: devEnv,
  tags: TagsProp('cloudwatch-evidently', devEnv)
})

new AmplifyConsoleReactStack(app, 'AmplifyConsoleReactStack', devEnv, {
  description: 'Amplify console for hosting react app',
  env: devEnv
})
app.synth();