
import { APIGatewayEvent, APIGatewayProxyResult, Context, Handler } from 'aws-lambda'

import { BlogPostService } from '../service/blog-get-service';

const TABLE_NAME = process.env.TABLE_NAME!;
const blogPostService = new BlogPostService(TABLE_NAME);

export const getBlogPostHandler:Handler = async (event:APIGatewayEvent)  => {
  const order = event?.queryStringParameters?.order
  let blogPosts = await blogPostService.getAllBlogPost();

  if(order === "asc"){
    blogPosts = blogPosts.sort((blogPostsA, blogPostsB) =>
    blogPostsA.createdAt.localeCompare(blogPostsB.createdAt)
    );
  }else{
    blogPosts = blogPosts.sort((blogPostsA, blogPostsB) =>
    blogPostsB.createdAt.localeCompare(blogPostsA.createdAt)
    );
  }
  return {
    statusCode: 200,
     body: JSON.stringify(blogPosts)    
  } 
}

export const getBlogPostbyIDHandler:Handler = async (event:APIGatewayEvent)  => {
const id = event.pathParameters!.id
console.log("Event",event);
console.log("Event Path Parameter",event.pathParameters);
const blogPost = await blogPostService.getBlogPostbyID(id!);
  return {
    statusCode: 200,
     body: JSON.stringify(blogPost)    
  } 
}