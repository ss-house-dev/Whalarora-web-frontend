# 1. Base image สำหรับ build default Node.js application
# ใช้ Node.js 20 บน Alpine Linux เพื่อขนาดเล็กและประสิทธิภาพสูง
FROM node:20-alpine AS builder
WORKDIR /app

# 2. ติดตั้ง pnpm ทั่วระบบ
RUN npm install -g pnpm

# 3. คัดลอกไฟล์ dependencies
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# 4. คัดลอกซอร์สโค้ดทั้งหมด
COPY . .

# 5. Build Next.js (จะ build tailwind ให้อัตโนมัติ)
RUN pnpm build

# 6. Production image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# 7. ติดตั้ง pnpm ทั่วระบบ (ต้องใช้ตอน run)
RUN npm install -g pnpm

# 8. คัดลอกไฟล์จำเป็นจาก builder มา
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# 9. สั่งรัน Next.js ด้วย pnpm
CMD ["pnpm", "start"]
