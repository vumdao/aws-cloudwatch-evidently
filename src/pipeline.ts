import { Stack, StackProps } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { EvidentlyPipelineStage } from './pipeline-stages';
import { EnvironmentConfig } from './shared/environment';

export class EvidentlyPipelineStack extends Stack {
  constructor(scope: Construct, id: string, reg: EnvironmentConfig, props: StackProps) {
    super(scope, id, props);

    const prefix = `${reg.pattern}-${reg.stage}-evidently-demo`;

    const repo = new Repository(this, `${prefix}-pipeline`, {
      description: 'Cloudwatch Evidently demo pipeline',
      repositoryName: prefix,
    });

    const genPipeline = function(_scope: Construct, branch: string) {
      const _pipeline = new CodePipeline(_scope, `${prefix}-${branch}`, {
        pipelineName: `${prefix}-${branch}`,
        synth: new CodeBuildStep('SynthStep', {
          input: CodePipelineSource.codeCommit(repo, branch),
          installCommands: ['npm install -g aws-cdk'],
          commands: [
            'yarn install',
            'npx projen build',
            'npx projen synth',
          ],
        }),
      });
      return _pipeline;
    };

    const masterPipeline = genPipeline(this, 'master');
    masterPipeline.addStage(new EvidentlyPipelineStage(this, 'DeployMaster', reg, {
      env: {
        account: this.account,
        region: this.region, // should be DEV_REGION or PROD_REGION
      },
    }));
  }
}