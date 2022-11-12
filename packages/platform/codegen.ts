import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/generated/schema.graphql',
  documents: 'src/ops/**/*.graphql',
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    'src/generated/ops.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-resolvers',
        'typed-document-node',
        'fragment-matcher',
      ],
    },
    'src/generated/schema.json': {
      plugins: ['introspection'],
    },
  },
}

export default config
