import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { IBlogPost } from "../config/EntityBlog"

export class BlogPostService {
  private tableName: string;
  private dynamo: DynamoDBClient;
  constructor(tableName: string) {
    this.tableName = tableName;
    this.dynamo = new DynamoDBClient({});
  }

  async saveBlogPost(blogPost: IBlogPost): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: marshall(blogPost)
    }
    const command = new PutItemCommand(params);
    await this.dynamo.send(command);
  }
}
