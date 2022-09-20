import { awscdk } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.42.0',
  defaultReleaseBranch: 'master',
  name: 'aws-cloudwatch-evidently',
  projenrcTs: true,

  deps: [
    'dotenv', 'child_process', 'env-var',
    '@aws-cdk/aws-amplify-alpha'
  ]
});

project.gitignore.addPatterns('node_modules')
project.gitignore.addPatterns('.env');
project.gitignore.addPatterns('*.yaml');

project.synth();
