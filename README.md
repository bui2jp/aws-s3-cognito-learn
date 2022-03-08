# aws-s3-cognito-learn

静的コンテンツを s3 に配置して、cognitoで認証をかける方法について

Authorization@Edge 
– How to Use Lambda@Edge and JSON Web Tokens to Enhance Web Application Security
https://aws.amazon.com/jp/blogs/networking-and-content-delivery/authorizationedge-how-to-use-lambdaedge-and-json-web-tokens-to-enhance-web-application-security/

## このサイトのサンプルを動かす (Cloud Formation)
```
Lambda@EdgeのNodeのバージョンを14に変更するために、cloudformationのtemplateを変更
変更済みのローカルファイルを指定してCloudFormationのstackを作成
```

## 変更・確認用のファイル
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

# cognito
## ユーザープールについて
IDトークン
```
```
アクセストークン
```
```
リフレッシュトークン
```
```

# AWS CLIを使ってトークンを確認

```
% aws --version 
aws-cli/2.4.23 Python/3.8.8 Darwin/21.3.0 exe/x86_64 prompt/off
```

## サインインしてIDトークン、アクセストークンが取得できる
```
USER_POOL_ID=us-east-1_xxxxx
CLIENT_ID=<xxxx>
USER_NAME="test01"
PASSWORD="Password@123"
aws --region us-east-1 cognito-idp admin-initiate-auth \
  --user-pool-id ${USER_POOL_ID} \
  --client-id ${CLIENT_ID} \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters "USERNAME=${USER_NAME},PASSWORD=${PASSWORD}"
```

## ID_TOKENを取り出す例
```
D_TOKEN=$(aws cognito-idp admin-initiate-auth \
  --user-pool-id ${USER_POOL_ID} \
  --client-id ${CLIENT_ID} \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters "USERNAME=${USER_EMAIL},PASSWORD=${PASSWORD}" \
  --query "AuthenticationResult.IdToken" | sed "s/\"//g") && echo ${ID_TOKEN}
```

```
echo ${ID_TOKEN} | cut -d'.' -f 2 | base64 -D | jq . 
```