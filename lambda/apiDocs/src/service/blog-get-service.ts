import { DeleteItemCommand, DynamoDBClient, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall,unmarshall } from "@aws-sdk/util-dynamodb";
import { IBlogPost } from "../config/EntityBlog"

export class BlogPostService {
  private tableName: string;
  private dynamo: DynamoDBClient;
  constructor(tableName: string) {
    this.tableName = tableName;
    this.dynamo = new DynamoDBClient({});
  }

  async deleteBlogPostbyID(id:string): Promise< void> {
    const params = {
      TableName: this.tableName,
      Key: marshall({id})
    }
    const command = new DeleteItemCommand(params);
    await this.dynamo.send(command);  
  }
}
