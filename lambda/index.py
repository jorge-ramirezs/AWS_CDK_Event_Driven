import os
import boto3


def handler(event, context):
    # Get bucket name
    records = event['Records']
    for record in records:
        bucket_name = record['s3']['bucket']['name']
        object_key = record['s3']['object']['key']

        glue_job_name = os.environ['GLUE_JOB_NAME']

        # Trigger the glue job
        client = boto3.client('glue')

        response = client.start_job_run(
            JobName=glue_job_name,
            Arguments={
                '--s3-bucket': bucket_name,
                '--s3-key': object_key,
            }
        )

        print(f"Glue Job Triggered: {response['JobRunId']}")
