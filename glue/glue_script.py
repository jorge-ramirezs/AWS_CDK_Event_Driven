import sys
import boto3
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

args = getResolvedOptions(sys.argv, ['GLUE_JOB', 's3_bucket', 's3_key'])

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['GLUE_JOB'])

s3_bucket = args['s3_bucket']
s3_key = args['s3_key']

# Perform any processiong or transformation

s3_client = boto3.client('s3')
s3_client.copy_object(
    Bucket=s3_bucket,
    Key='archive/'+s3_key,
    CopySource={'Bucket': s3_bucket, 'Key': s3_key}
)
s3_client.delete_object(
    Bucket=s3_bucket,
    Key=s3_key
)

job.commit()
