import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/graphql/generated/schema.graphql',
  documents: '../../node_modules/@gbl-uzh/platform/dist/ops/**/*.graphql',
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    'src/graphql/generated/ops.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-resolvers',
        'typed-document-node',
        'fragment-matcher',
      ],
    },
    'src/graphql/generated/schema.json': {
      plugins: ['introspection'],
    },
  },
}

export default config
