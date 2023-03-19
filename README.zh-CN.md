# YAO WMS

![Image](docs/images/intro.jpg)

[English](README.md)

仓库管理系统

参考文档: [https://yaoapps.com/doc](https://yaoapps.com/doc/%E4%BB%8B%E7%BB%8D/%E5%85%A5%E9%97%A8%E6%8C%87%E5%8D%97)

## 下载安装

### 在本地运行

#### 下载源码

```bash
git clone https://github.com/wwsheng009/yao-templates /app/path/wms

```

#### 设置环境变量

部分功能不支持 mysql，需要自己适配

````bash

mkdir /app/path/wms/data
mkdir /app/path/wms/logs

cp /app/path/wms/.env.sample  /app/path/wms/.env
```

#### 项目初始化

```bash
cd /app/path/wms

# 创建数据表
yao migrate --reset

# 演示数据
yao run flows.demo.data

````

#### 启动服务

```bash
cd /app/path/wms
yao start
```

## 管理后台

打开浏览器输入以下网址进入:

http://127.0.0.1:5099/admin/login/admin

用户名: `xiang@iqka.com`
密码: `A123456p+`
