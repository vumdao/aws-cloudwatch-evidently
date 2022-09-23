import { App } from 'aws-cdk-lib';
import { AmplifyConsoleReactStack } from './amplify-console';
import { EvidentlyPipelineStack } from './pipeline';
import { devEnv } from './shared/environment';
import { TagsProp } from './shared/tagging';

const app = new App();

new EvidentlyPipelineStack(app, 'EvidentlyPipelineStack', devEnv, {
  description: 'Evidently pipeline',
  env: devEnv,
  tags: TagsProp('evidently', devEnv),
});

new AmplifyConsoleReactStack(app, 'AmplifyConsoleReactStack', devEnv, {
  description: 'Amplify console for hosting react app',
  env: devEnv,
});
app.synth();