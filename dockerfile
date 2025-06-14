FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy the entire project
COPY . .

# Install all dependencies (including devDependencies), generate Prisma client, build, then install prod only
RUN pnpm install && npx prisma generate && pnpm run build && pnpm install --prod

# Expose the port
EXPOSE 3000

# Start the production server
CMD ["pnpm", "run", "start:prod"]