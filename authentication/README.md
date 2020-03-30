# 설치

## Token Secret 이란
> Access Token의 전자서명(HMAC)을 위한 Token

## Token Secret 설정하기

1. Token Secret 암호화를 위한 KMS 키 생성

```
aws kms create-key \
    --region ap-northeast-2 \
    --tags TagKey=stage,TagValue=asem \
    --description "for auth-privider's encrypt token secret"
```

2. 생성한 키의 alias 지정하기

```
aws kms create-alias \
    --region ap-northeast-2 \
    --alias-name alias/auth-provider \
    --target-key-id f7730106-91f3-4b24-9ebc-b4db950416af
```

3. Token Secret 암호화 하기

> example string : test_asem_key 
> base64: ZktNZnZKYXBoMkRrc0JjZ1BaQjk

```bash
aws kms encrypt \
    --region ap-northeast-2 \
    --key-id f7730106-91f3-4b24-9ebc-b4db950416af \
    --plaintext ZktNZnZKYXBoMkRrc0JjZ1BaQjk= \
    --output text \
    --query CiphertextBlob | base64 \
    --decode > token_secret
```

4. 복호화 하기(확인)

```bash
aws kms decrypt \
    --region ap-northeast-2 \
    --ciphertext-blob fileb://token_secret \
    --output text \
    --query Plaintext | base64 \
    --decode
```

```bash
aws kms decrypt \
    --region ap-northeast-2 \
    --ciphertext-blob fileb://token_secret \
    --output text \
    --query Plaintext
```

### CURL Test

```bash
curl -I -H 'Authorization: {JWT TOKEN}' \
https://td7tx2gu25.execute-api.us-west-1.amazonaws.com/authtest/api/account/get
```
