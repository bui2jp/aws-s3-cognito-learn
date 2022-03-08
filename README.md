# aws-s3-cognito-learn

静的コンテンツを s3 に配置して、cognitoで認証をかける方法について

Authorization@Edge 
– How to Use Lambda@Edge and JSON Web Tokens to Enhance Web Application Security
https://aws.amazon.com/jp/blogs/networking-and-content-delivery/authorizationedge-how-to-use-lambdaedge-and-json-web-tokens-to-enhance-web-application-security/

このサイトのサンプル

## 各file
```
% tree 
.
├── README.md
├── docs
│   └── s3-cognito.drawio.png
├── my-edge-auth.template # my-lambda-at-edge.templateを指定するように変更
├── my-lambda-at-edge.template # nodeのバージョンを変更
└── origin-public # s3に展開されるpublic
    ├── index.html
    ├── js
    │   ├── amazon-cognito-identity.min.js
    │   ├── aws-cognito-sdk.min.js
    │   └── config.js
    └── lambda-at-edge
        └── edge-auth
            └── index.js #lambda@edgeの関数
```

