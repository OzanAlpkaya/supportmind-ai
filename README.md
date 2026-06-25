# SupportMind AI

AI-powered customer support and knowledge base SaaS.

## Tech Stack

- React + TypeScript + Vite
- NestJS
- PostgreSQL + pgvector
- Prisma
- Redis
- JWT auth
- OpenAI embeddings and Responses API
- Docker

## Product Scope

SupportMind AI is a multi-tenant support platform with:

- JWT authentication
- Workspace-based authorization
- Customers
- Conversations and messages
- Knowledge base documents
- Document chunking
- OpenAI embedding generation
- pgvector semantic retrieval
- RAG answer generation
- AI reply suggestions for support inbox conversations
- Dashboard analytics
- Profile and workspace settings

## RAG Flow

```txt
User question
  -> OpenAI embedding
  -> pgvector similarity search scoped by workspace
  -> relevant DocumentChunk sources
  -> RAG prompt builder
  -> OpenAI answer
  -> answer + sources
```

## Important Environment Variables

`apps/api/.env`:

```env
DATABASE_URL="postgresql://supportmind:supportmind@localhost:5432/supportmind?schema=public"
JWT_SECRET="replace-me"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
OPENAI_CHAT_MODEL="gpt-5.5"
```

`apps/web/.env`:

```env
VITE_API_BASE_URL="http://localhost:3000"
VITE_API_URL="http://localhost:3000"
```

## Local Setup

```bash
npm install

docker compose up -d

cd apps/api
npx prisma migrate dev
npx prisma generate
npm run start:dev

cd ../web
npm run dev
```

## Useful API Flows

### Ask AI

```http
POST /ai/answer
Authorization: Bearer <accessToken>
x-workspace-id: <workspaceId>
Content-Type: application/json

{
  "question": "Can I get a refund after 10 days?"
}
```

### Suggest AI Reply For Conversation

```http
POST /conversations/:id/ai-suggest-reply
Authorization: Bearer <accessToken>
x-workspace-id: <workspaceId>
```

### Rebuild Document Chunks Manually

```http
POST /documents/:id/chunks/rebuild
Authorization: Bearer <accessToken>
x-workspace-id: <workspaceId>
```

## Notes

- Only `PUBLISHED` documents are used by retrieval.
- Draft or archived documents have their chunks removed from retrieval.
- All RAG retrieval is scoped by `x-workspace-id`.
- AI answers include source chunks and similarity metadata.
