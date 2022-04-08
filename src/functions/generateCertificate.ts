import {APIGatewayProxyHandler} from 'aws-lambda'
import { document }  from '../utils/dynamodbClient'
import { compile} from 'handlebars';
import dayjs from 'dayjs'
import {join} from 'path'
import { readFileSync} from 'fs'
import {S3} from 'aws-sdk'


import chromium from 'chrome-aws-lambda'

interface ICreateCertificate {
  id: string;
  name: string;
  grade: string
}

interface ITemplate {
  id: string;
  name: string;
  grade: string
  medal: string;
  date: string
}

const compileTemplate = async (data: ITemplate) => {
  // compila pra utilizar o hbs
  const filePath = join(process.cwd(), 'src', 'templates', 'certificate.hbs') //  cwd -> raiz do projeto e não do diretório
  const html =  readFileSync(filePath, 'utf-8')

  return compile(html)(data)
}

export const handler: APIGatewayProxyHandler = async (event) => {
  // id, name, grade -> dados do usuário
  const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;



  // buscando o registro no banco
  const response = await document.query({
    TableName: "users_certificate",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise();


  const userAlreadyExists = response.Items[0]

  if (!userAlreadyExists) {
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
  }





  const medalPath = join(process.cwd(), 'src','templates', 'selo.png')
  const medal = readFileSync(medalPath, 'base64')

  const data: ITemplate = {
    name, 
    id,
    grade,
    date: dayjs().format('DD/MM/YYYY'),
    medal
  }

  const content = await compileTemplate(data)

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    // defaulViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath
  });

  const page = await browser.newPage();
  
  await page.setContent(content);
  const pdf = await page.pdf({
    format: "a4",
    landscape: true,
    printBackground: true, // força a mudar a cor de fundo, para impressões
    preferCSSPageSize: true,
    path: process.env.IS_OFFLINE ? './certificate.pdf' : null,
  })
  

  await browser.close()

  const s3 = new S3();
  await s3.putObject({
    Bucket: "certificate-ignite-miro",
    Key: `${id}.pdf`,
    ACL: "public-read",
    Body: pdf,
    ContentType: "application/pdf"
  }).promise();

  // o query não consegue trazer o dado igual no findOne, ele sempre retorna um array

  return {
    statusCode: 201,
    body: JSON.stringify({
      // message: response.Items[0],
      message: "Certificado criado com sucesso",
      url: `https://certificate-ignite-miro.s3.amazonaws.com/${id}.pdf`
    })
  }
}