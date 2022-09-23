import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CloudwatchEvidentlyStack } from './evidently';
import { EnvironmentConfig } from './shared/environment';
import { TagsProp } from './shared/tagging';

export class EvidentlyPipelineStage extends Stage {
  constructor(scope: Construct, id: string, reg: EnvironmentConfig, props?: StageProps) {
    super(scope, id, props);

    new CloudwatchEvidentlyStack(this, 'CloudwatchEvidentlyStack', reg, {
      env: props?.env,
      tags: TagsProp('evidently', reg),
    });
  }
}
