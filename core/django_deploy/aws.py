import boto3
import os
import dotenv

dotenv.load_dotenv()

def create_instance():
    ec2 = boto3.resource(
        'ec2',
        region_name=os.getenv('AWS_REGION'),
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )

    instance = ec2.create_instances(
        ImageId=os.getenv('AWS_AMI_ID'),
        InstanceType='t2.micro',
        MinCount=1,
        MaxCount=1,
        KeyName=os.getenv('AWS_KEY_PAIR_NAME'),
        SecurityGroups=['launch-wizard-10'],  # <- Ensure this group allows ports 22 & 80
        TagSpecifications=[{
            'ResourceType': 'instance',
            'Tags': [{'Key': 'Name', 'Value': 'AutoDeploy'}]
        }]
    )[0]

    instance.wait_until_running()
    instance.reload()
    return instance.instance_id, instance.public_ip_address
