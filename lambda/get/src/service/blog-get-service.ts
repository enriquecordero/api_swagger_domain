import { DynamoDBClient, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall,unmarshall } from "@aws-sdk/util-dynamodb";
import { IBlogPost } from "../config/EntityBlog"

export class BlogPostService {
  private tableName: string;
  private dynamo: DynamoDBClient;
  constructor(tableName: string) {
    this.tableName = tableName;
    this.dynamo = new DynamoDBClient({});
  }

  async getAllBlogPost(): Promise<IBlogPost []> {
    const params = {
      TableName: this.tableName,
    }
    const command = new ScanCommand(params);
    const response = await this.dynamo.send(command);
    const Items = response.Items ?? [];
    return Items.map((item) =>unmarshall(item) as IBlogPost); 
  }

  async getBlogPostbyID(id:string): Promise< IBlogPost| null> {
    const params = {
      TableName: this.tableName,
      Key: marshall({id})
    }
    const command = new GetItemCommand(params);
    const response = await this.dynamo.send(command);
    const item = response.Item;
    if(!item){
      return null;
    }
    return unmarshall(item) as IBlogPost; 
  }
}
