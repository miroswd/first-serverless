import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'certificateignite',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-offline'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: {
    /* hello world :')
    hello: {
      handler: "src/functions/hello.handler", // path
      events: [
        {
          http: {
            path: "hello",
            method: "get",
            cors: true
          }
        }
      ]
    } */
    generateCertificate: {
      handler: "src/functions/generateCertificate.handler", // path
      events: [
        {
          http: {
            path: "generateCertificate",
            method: "post",
            cors: true
          }
        }
      ]
    }
    }, // aqui que declara as funções
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      stages: ["dev", "local"],
      start: {
        port: 8000,
        inMemory: true, 
        migrate: true
      }
    }
  },
  resources: { 
    Resources: /* permite criar uma tabela */ {
      dbCertificatedUsers: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "users_certificate",
          ProvisionedThroughput: {
            // quantas requisições por segundo
            ReadCapacityUnits: 5, 
            WriteCapacityUnits: 5, 
          },
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            }
          ]
        }
      }
  }
  }
};

module.exports = serverlessConfiguration;
