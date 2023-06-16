import { APIGatewayEvent, Handler } from "aws-lambda";
import {
  APIGatewayClient,
  GetExportCommand,
} from "@aws-sdk/client-api-gateway";

import { BlogPostService } from "../service/blog-get-service";

const apigateway = new APIGatewayClient({});
const restApiID = process.env.API_ID!;

export const apiDocsHandler: Handler = async (event: APIGatewayEvent) => {
  const ui = event?.queryStringParameters?.ui;
  const getExportCommand = new GetExportCommand({
    restApiId: restApiID,
    exportType: "swagger",
    accepts: "application/json",
    stageName: "prod",
  });

  const api = await apigateway.send(getExportCommand);
  const response = Buffer.from(api.body!).toString("utf-8");
  if (!ui) {
    return {
      statusCode: 200,
      body: response,
    };
  }
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta
    name="description"
    content="SwaggerUI"
  />
  <title>SwaggerUI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" crossorigin></script>
<script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({
      url: 'api-docs',
      dom_id: '#swagger-ui',
    });
  };
</script>
</body>
</html>`;

  return {
    statusCode: 200,
    body: html,
    headers: {
      "Content-Type": "text/html",
    },
  };
};
