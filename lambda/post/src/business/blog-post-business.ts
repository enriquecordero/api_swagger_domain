
import { APIGatewayEvent, APIGatewayProxyResult, Context, Handler } from 'aws-lambda'
import {v4 as uuid} from 'uuid'
import {IBlogPost} from '../config/EntityBlog'
import { BlogPostService } from '../service/blog-post-service';

const TABLE_NAME = process.env.TABLE_NAME!;
const blogPostService = new BlogPostService(TABLE_NAME);

export const createBlogPostHandler:Handler = async (event: APIGatewayEvent):Promise<APIGatewayProxyResult>  => {
  
  console.log('Event', event);
  const blogRequest = JSON.parse(event.body!) as { 
    title:string,
    author:string,
    content:string,
  }
  console.log('blogRequest', blogRequest);

const id = uuid();
const createdAt = new Date().toISOString();

const blogPost: IBlogPost = {
  id:id,
  title:blogRequest.title,
  author: blogRequest.author,
  content:blogRequest.content,
  createdAt: createdAt
}
await blogPostService.saveBlogPost(blogPost);
  return {
    statusCode: 201,
    //body: TABLE_NAME
     body: JSON.stringify(blogPost)   
    
  } 
}