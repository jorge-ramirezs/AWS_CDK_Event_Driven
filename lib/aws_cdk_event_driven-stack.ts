import {
  Aws,
  Stack,
  StackProps,
  aws_s3 as s3,
  aws_s3_notifications as s3n,
  aws_lambda as lambda,
  aws_iam as iam,
  aws_glue as glue,
  CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class AwsCdkEventDrivenStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // This time we are importing an existing S3 Bucket
    const bucketPortfolio = s3.Bucket.fromBucketArn(
      this,
      "imported-bucket-from-arn",
      "arn:aws:s3:::cdk-portfolio-files",
    );

    // console.log("Bucket Name => ", bucketPortfolio.bucketName);
    // console.log("Bucket arn => ", bucketPortfolio.bucketArn);

    // Create a Glue job Role
    const glueJobRole = new iam.Role(this, "GlueJobRole", {
      assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
    });

    // Grant S3 read and write permissions to Glue Job Role
    bucketPortfolio.grantReadWrite(glueJobRole);

    // Create a Glue Job
    const glueJob = new glue.CfnJob(this, "GlueEventDriven", {
      command: {
        name: "glueetl",
        scriptLocation: `s3://${bucketPortfolio.bucketName}/code/glue_script.py`,
      },
      role: glueJobRole.roleArn,
      defaultArguments: {
        "--job-language": "python",
      },
      glueVersion: "3.0",
      executionProperty: {
        maxConcurrentRuns: 1,
      },
    });

    // Create Lambda Function to Trigger Glue Job
    const lambdaTrigger = new lambda.Function(this, "EventDrivenLambda", {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      environment: {
        GLUE_JOB_NAME: glueJob.ref,
      },
    });

    // Grant read permissions to Lambda on S3
    bucketPortfolio.grantRead(lambdaTrigger);

    // Grant permission to execute glue job
    const region = Aws.REGION;
    const accountId = Aws.ACCOUNT_ID;

    const glueJobArn = `arn:aws:glue:${region}:${accountId}:/job/${glueJob.ref}`;

    const glueJobPermission = new iam.PolicyStatement({
      actions: ["glue:StartJobRun"],
      resources: [glueJobArn],
    });

    lambdaTrigger.addToRolePolicy(glueJobPermission);

    // Create S3 event to trigger lambda function
    bucketPortfolio.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(lambdaTrigger),
      {
        prefix: "source/",
        suffix: ".txt",
      },
    );

    new CfnOutput(this, "GlueJobName", {
      value: glueJob.ref,
    });
  }
}
