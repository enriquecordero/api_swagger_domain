
import { APIGatewayEvent, Handler } from 'aws-lambda'

import { BlogPostService } from '../service/blog-get-service';

const TABLE_NAME = process.env.TABLE_NAME!;
const blogPostService = new BlogPostService(TABLE_NAME);

export const getBlogPostbyIDHandler:Handler = async (event:APIGatewayEvent)  => {
const id = event.pathParameters!.id
const blogPost = await blogPostService.deleteBlogPostbyID(id!);
  return {
    statusCode: 204,
     body: JSON.stringify(`Post with ID ${id} was deleted` )    
  } 
}