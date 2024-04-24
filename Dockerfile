#docker build --build-arg ARCH=amd64 --build-arg VERSION=0.10.3 --tag yao-wms-dev .
#docker run -d --restart unless-stopped --name yao-wms-dev -p 5099:5099 yao-wms-dev

ARG ARCH
FROM wwsheng009/yao-${ARCH}:latest

ARG ARCH
ARG VERSION
WORKDIR /data


RUN addgroup -S -g 1000 yao && adduser -S -G yao -u 999 yao
RUN mkdir -p /data && curl -fsSL "https://github.com/wwsheng009/yao-wms/releases/download/yao-wms-${VERSION}/yao-wms-${VERSION}.zip" > /data/latest.zip && \
    unzip /data/latest.zip && rm /data/latest.zip && \
    rm -rf /data/.git && \
    chown -R yao:yao /data && \
    chmod +x /data/init.sh && \
    chmod +x /usr/local/bin/yao && \
    mkdir -p /data/plugins && \
    mkdir -p /data/db

# RUN mkdir -p /data

USER root
VOLUME [ "/data" ]
WORKDIR /data
EXPOSE 5099
CMD ["sh", "init.sh"]