# YAO WMS

![Image](docs/images/intro.jpg)

[中文介绍](README.zh-CN.md)

Warehouse Management Sytem

Documentation: [https://yaoapps.com/en-US/doc](https://yaoapps.com/en-US/doc/Introduction/Getting%20Started)

## USAGE

### Yao

#### Download source code

```bash
git clone https://github.com/wwsheng009/yao-wms /app/path/wms

```

#### Set the environment variables

mysql not support yet.

````bash

mkdir /app/path/wms/data
mkdir /app/path/wms/logs

cp /app/path/wms/.env.sample  /app/path/wms/.env
```

#### Initialization

```bash
cd /app/path/wms/

# Create tables & set menu
yao migrate --reset
# Demo data
yao run flows.demo.data

````

#### Start the service

```bash
cd /app/path/wms/
yao start
```

## ADMIN

Open the browser to visit the URL:

http://127.0.0.1:5099/admin/login/admin

User Name: `xiang@iqka.com`
Password: `A123456p+`
