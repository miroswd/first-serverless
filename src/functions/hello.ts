import {APIGatewayProxyHandler} from 'aws-lambda'
 
export const handler: APIGatewayProxyHandler = async (event) => {
  // event é responsável por trazer os dados da nossa função

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Hello World!"
    })
  }
}