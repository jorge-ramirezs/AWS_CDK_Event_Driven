import boto3


def handler(event, context):
    # Get bucket name
    records = event['Records']
    for record in records:
        bucket_name = record['s3']['bucket']['name']
        object_key = record['s3']['object']['key']

        print(f"Bucket Name: {bucket_name}")
        print(f"Object Name: {object_key}")
