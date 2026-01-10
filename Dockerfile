FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Prisma 도구 생성을 위해 스키마 파일 복사
# COPY prisma ./prisma/ 

RUN npm install

COPY . .

# ✅ FE용 entrypoint.sh 복사 및 권한 설정
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

# ✅ 실행 순서 보장 (스크립트 실행 후 npm run dev 실행)
ENTRYPOINT ["/usr/bin/entrypoint.sh"]

EXPOSE 3000

CMD ["npm", "run", "dev"]