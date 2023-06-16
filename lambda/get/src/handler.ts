
import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context, Handler } from 'aws-lambda'


export const createBlogPostHandler:Handler = async (event: APIGatewayEvent):Promise<APIGatewayProxyResult>  => {
  
return{
  statusCode:200,
  body: "message"
}
}