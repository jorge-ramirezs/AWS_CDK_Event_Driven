import { Stack, StackProps, aws_s3 as s3 } from "aws-cdk-lib";
import { Construct } from "constructs";
// import { aws_s3 as s3 } from "aws-cdk-lib";
// import * as cdk from 'aws-cdk-lib';

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
  }
}
