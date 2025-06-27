FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies and approve build scripts
RUN pnpm install --frozen-lockfile
RUN pnpm approve-builds

# Copy the rest of the project
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && pnpm run build

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Expose the port
EXPOSE 3000

# Start the production server
CMD ["pnpm", "run", "start:prod"]