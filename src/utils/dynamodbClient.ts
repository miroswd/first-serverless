import {DynamoDB} from 'aws-sdk'

const options = {
  region: "localhost",
  endpoint: "http://localhost:8000", // porta padrão do dynamo
  accessKeyId: "x",
  secretAccessKey: "x" // permite rodar local sem criar credenciais na aws
}

const isOffline = () => {
  return process.env.IS_OFFLINE; // Quando estiver usando o serveless offline, essa env já é definida automaticamente 
}


export const document = isOffline() ?
   new DynamoDB.DocumentClient(options) : 
   new DynamoDB.DocumentClient();