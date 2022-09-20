import { Stack, StackProps, SecretValue } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EnvironmentConfig } from "./shared/environment";
import { App, GitHubSourceCodeProvider } from "@aws-cdk/aws-amplify-alpha";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class AmplifyConsoleReactStack extends Stack {
  constructor(scope: Construct, id: string, reg: EnvironmentConfig, props: StackProps) {
    super(scope, id, props);

    const prefix = `${reg.pattern}-${reg.stage}-evidently-demo`;

    const role = new Role(this, `${prefix}-amplify-console-app`, {
      roleName: `${prefix}-amplify-console-app`,
      assumedBy: new ServicePrincipal('amplify.amazonaws.com'),
      managedPolicies: [{managedPolicyArn: 'arn:aws:iam::aws:policy/AdministratorAccess-Amplify'}]
    });

    const amplifyApp = new App(this, `${prefix}-amplify-console`, {
      appName: prefix,
      role: role,
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: 'vumdao',
        repository: 'aws-cloudwatch-evidently-react',
        oauthToken: SecretValue.secretsManager('github-token', {jsonField: 'github-token'})
      }),
      buildSpec: BuildSpec.fromObjectToYaml({
        version: '1.0',
        frontend: {
          phases: {
            preBuild: {
              commands: ['yarn'],
            },
            build: {
              commands: ['yarn build'],
            },
          },
          artifacts: {
            baseDirectory: 'build',
            files: ['**/*']
          },
          cache: {
            paths: ['node_modules/**/*']
          }
        },
      })
    });
    amplifyApp.addBranch('master');
  }
}