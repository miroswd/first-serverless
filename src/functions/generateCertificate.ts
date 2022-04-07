import {APIGatewayProxyHandler} from 'aws-lambda'
import { document }  from '../utils/dynamodbClient'

interface ICreateCertificate {
  id: string;
  name: string;
  grade: string
}

export const handler: APIGatewayProxyHandler = async (event) => {
  // id, name, grade -> dados do usuário
  const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

  console.log("aqui chegou")

  // put q insere o dado na tabela
  await document.put({
    TableName: "users_certificate",
    Item: {
      id, 
      name,
      grade,
      created_at: new Date().getTime()
    }
  }) .promise()  

console.log("teste")

  // buscando o registro no banco
  const response = await document.query({
    TableName: "users_certificate",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise();


  // o query não consegue trazer o dado igual no findOne, ele sempre retorna um array

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: response.Items[0]
    })
  }
}