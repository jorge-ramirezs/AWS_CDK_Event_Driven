import {
  Stack,
  StackProps,
  aws_s3 as s3,
  aws_s3_notifications as s3n,
  aws_lambda as lambda,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class AwsCdkEventDrivenStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // This time we are importing an existing S3 Bucket
    const bucketArn = s3.Bucket.fromBucketArn(
      this,
      "imported-bucket-from-arn",
      "arn:aws:s3:::cdk-portfolio-files",
    );

    console.log("Bucket Name => ", bucketArn.bucketName);
    console.log("Bucket arn => ", bucketArn.bucketArn);

    // Create Lambda Function to Trigger Glue Job
    const lambdaTrigger = new lambda.Function(this, "EventDrivenLambda", {
      runtime: lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
    });

    // Grant read permissions to Lambda on S3
    bucketArn.grantRead(lambdaTrigger);

    // Create S3 event to trigger lambda function
    bucketArn.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(lambdaTrigger),
      {
        prefix: "source/*.txt",
      },
    );
  }
}
