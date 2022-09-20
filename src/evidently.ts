import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { CfnExperiment, CfnFeature, CfnLaunch, CfnProject } from "aws-cdk-lib/aws-evidently";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { EnvironmentConfig } from "./shared/environment";
import { InsideTags } from "./shared/tagging";

export class CloudwatchEvidentlyStack extends Stack {
  constructor(scope: Construct, id: string, reg: EnvironmentConfig, props: StackProps) {
    super(scope, id, props);

    const prefix = `${reg.pattern}-${reg.stage}-evidently-demo`;

    const s3 = new Bucket(this, `${prefix}-evidently-demo-data-storage`, {
      bucketName: `${prefix}-evidently-demo-data-storage`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      enforceSSL: true
    });

    const proj = new CfnProject(this, `${prefix}-evidently-demo`, {
      description: 'S3 bucket to store evidently project evaluation events',
      name: `${prefix}-evidently-demo`,
      dataDelivery: {
        s3: {bucketName: s3.bucketName}
      },
      tags: InsideTags('evidently', reg)
    });

    const feature = new CfnFeature(this, `${prefix}-evaluation-demo`, {
      description: 'Evaluation-demo feature',
      name: `${prefix}-evaluation-demo`,
      project: proj.name,
      variations: [
        {booleanValue: false, variationName: 'Variation1'},
        {booleanValue: true, variationName: 'Variation2'}
      ],
      defaultVariation: 'Variation1',
      evaluationStrategy: 'ALL_RULES',
      tags: InsideTags('evidently', reg)
    });
    feature.node.addDependency(proj);

    const featureExp = new CfnFeature(this, `${prefix}-evaluation-exp`, {
      description: 'Evaluation-demo feature exp',
      name: `${prefix}-evaluation-exp`,
      project: proj.name,
      variations: [
        {booleanValue: false, variationName: 'Variation1'},
        {booleanValue: true, variationName: 'Variation2'}
      ],
      defaultVariation: 'Variation1',
      evaluationStrategy: 'ALL_RULES',
      tags: InsideTags('evidently', reg)
    });
    featureExp.node.addDependency(proj);

    const launch = new CfnLaunch(this, `${prefix}-launch-test`, {
      name: `${prefix}-launch-test`,
      project: proj.attrArn,
      groups: [
        {
          groupName: 'test-launch-1',
          feature: feature.name,
          variation: 'Variation1'
        },
        {
          groupName: 'test-launch-2',
          feature: feature.name,
          variation: 'Variation2'
        }
      ],
      scheduledSplitsConfig: [
        {
          groupWeights: [
            {
              groupName: 'test-launch-1',
              splitWeight: 20000,
            },
            {
              groupName: 'test-launch-2',
              splitWeight: 80000,
            },
          ],
          startTime: new Date().toISOString()
        }
      ],
      executionStatus: {status: 'START'},
      tags: InsideTags('evidently', reg)
    });
    launch.node.addDependency(feature);

    const eventPattern = {
      entityId: [
        {
          exists: true
        }
      ],
      ['details.loadTime']: [
        {
          exists: true
        }
      ]
    }

    const exp = new CfnExperiment(this, `${prefix}-experiment`, {
      name: `${prefix}-experiment`,
      project: proj.name,
      description: 'Test experiment',
      metricGoals: [{
        desiredChange: 'INCREASE',
        entityIdKey: 'entityId',
        metricName: 'load-time-in-second',
        eventPattern: JSON.stringify(eventPattern),
        valueKey: "details.loadTime",
        unitLabel: 'Second'
      }],
      onlineAbConfig: {
        controlTreatmentName: `${prefix}-experiment-treatment-1`,
        treatmentWeights: [
          {
            splitWeight: 50000,
            treatment: `${prefix}-experiment-treatment-1`
          },
          {
            splitWeight: 50000,
            treatment: `${prefix}-experiment-treatment-2`
          }
        ]
      },
      treatments: [
        {
          treatmentName: `${prefix}-experiment-treatment-1`,
          feature: featureExp.name,
          variation: 'Variation1'
        },
        {
          treatmentName: `${prefix}-experiment-treatment-2`,
          feature: featureExp.name,
          variation: 'Variation2'
        }
      ],
      runningStatus: {
        status: 'START',
        analysisCompleteTime: '2022-09-27T06:47:03.387Z'
      }
    });
    exp.node.addDependency(featureExp)
  }
}