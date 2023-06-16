import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { DomainName, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { ApiGatewayDomain } from "aws-cdk-lib/aws-route53-targets";

export class RestApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Rest API
    const api = new RestApi(this, "blogPostApi", {
      restApiName: "BlogApi",
    });
    //DynamoDB Table
    const blogTable = new Table(this, "blogTable", {
      tableName: "IblogTable",
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });
    // Create POST lambda
    const createBlogPost = new NodejsFunction(this, "createBlogPostHandler", {
      runtime: Runtime.NODEJS_18_X,
      functionName: "createBlogPost",
      handler: "createBlogPostHandler",
      entry: join(
        __dirname,
        "..",
        "lambda",
        "post",
        "src",
        "business",
        "blog-post-business.ts"
      ),
      environment: {
        TABLE_NAME: blogTable.tableName,
      },
    });

    //Permition to write to dynamo
    blogTable.grantWriteData(createBlogPost);

    // Create GET lambda
    const getBlogPost = new NodejsFunction(this, "getBlogPostHandler", {
      runtime: Runtime.NODEJS_18_X,
      functionName: "getBlogPost",
      handler: "getBlogPostHandler",
      entry: join(
        __dirname,
        "..",
        "lambda",
        "get",
        "src",
        "business",
        "blog-get-business.ts"
      ),
      environment: {
        TABLE_NAME: blogTable.tableName,
      },
    });

    //Permition to read to dynamo
    blogTable.grantReadData(getBlogPost);

    // Create GET lambda BY ID
    const getBlogPostbyID = new NodejsFunction(this, "getBlogPostbyIDHandler", {
      runtime: Runtime.NODEJS_18_X,
      functionName: "getBlogPostbyID",
      handler: "getBlogPostbyIDHandler",
      entry: join(
        __dirname,
        "..",
        "lambda",
        "get",
        "src",
        "business",
        "blog-get-business.ts"
      ),
      environment: {
        TABLE_NAME: blogTable.tableName,
      },
    });

    //Permition to read to dynamo
    blogTable.grantReadData(getBlogPostbyID);

    // Create Delete lambda BY ID
    const deleteBlogPost = new NodejsFunction(this, "deleteBlogPostHandler", {
      runtime: Runtime.NODEJS_18_X,
      functionName: "deleteBlogPost",
      handler: "deleteBlogPostHandler",
      entry: join(
        __dirname,
        "..",
        "lambda",
        "delete",
        "src",
        "business",
        "blog-delete-business.ts"
      ),
      environment: {
        TABLE_NAME: blogTable.tableName,
      },
    });

    //Permition to read to dynamo
    blogTable.grantWriteData(deleteBlogPost);


    // Create APIDOCS lambda 
    const apiDocsLambdaName = new NodejsFunction(this, "apiDocsHandler", {
      runtime: Runtime.NODEJS_18_X,
      functionName: "apiDocsLambdaName",
      handler: "apiDocsHandler",
      entry: join(
        __dirname,
        "..",
        "lambda",
        "apiDocs",
        "src",
        "business",
        "blog-apidocs-business.ts"
      ),
      environment: {
        API_ID: api.restApiId,
      },
    });

    const policy = new PolicyStatement({
      actions: ["apigateway:GET"],
      resources: ['*']
    });
    apiDocsLambdaName.role?.addToPrincipalPolicy(policy);

    const apiDocsResource = api.root.addResource("api-docs");
    apiDocsResource.addMethod("GET", new LambdaIntegration(apiDocsLambdaName),{
      requestParameters: {
        "method.request.querystring.ui": false,
      }
    });



    //POST https://example.com/blogposts
    const blogResources = api.root.addResource("blogposts");
    blogResources.addMethod("POST", new LambdaIntegration(createBlogPost));
    blogResources.addMethod("GET", new LambdaIntegration(getBlogPost), {
      requestParameters: {
        "method.request.querystring.order": false, // el que sea falso lo hace opcional
      },
    });
    const blogPostByID = blogResources.addResource("{id}");
    blogPostByID.addMethod("GET", new LambdaIntegration(getBlogPostbyID));
    blogPostByID.addMethod("DELETE", new LambdaIntegration(deleteBlogPost));

    const hostedZone = HostedZone.fromLookup(this,'HostedZone',{
      domainName: "enriquecordero.net"
    });
    const certicate = new Certificate(this,'Certificate',{
      domainName: "api.enriquecordero.net",
      validation: CertificateValidation.fromDns(hostedZone)            
    })

    const customDomain = new DomainName(this,"CustomDomain",{
      domainName: "api.enriquecordero.net",
      certificate: certicate          
    });
    customDomain.addBasePathMapping(api);

    new ARecord(this,'ARecordAPI',{
      zone: hostedZone,
      recordName: "api.enriquecordero.net",
      target: RecordTarget.fromAlias(new ApiGatewayDomain(customDomain))     
    })
  }
}
