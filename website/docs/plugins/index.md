---
id: index
title: All Plugins
---

The general purpose of GraphQL Code Generator is to parse GraphQL syntax, transform it into an AST and then output it into desired formats which can vary. Since there can potentially be an infinite number of formats, we can't predict them all. However, some formats are more likely to be used, thus, we've prepared pre-defined code generation plugins which are built for these formats.

## Available Plugins

Below is a table that lists all available plugins which can be installed via NPM, along with a short description. If you're looking for anything specific, we might already have the solution:

| Format                             | Purpose                                                                                                | Package Name & Docs                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript`                       | Generate types for TypeScript - those are usually relevant for both client side and server side code   | [`@fevo-tech/graphql-codegen-typescript`](./typescript.md)                                                                                             |
| `typescript-operations`            | Generate client specific TypeScript types (query, mutation, subscription, fragment)                    | [`@fevo-tech/graphql-codegen-typescript-operations`](./typescript-operations.md)                                                                       |
| `typescript-resolvers`             | Generate TypeScript signature for server-side resolvers                                                | [`@fevo-tech/graphql-codegen-typescript-resolvers`](./typescript-resolvers.md)                                                                         |
| `typescript-apollo-angular`        | Generate TypeScript types, and Apollo-Angular Services                                                 | [`@fevo-tech/graphql-codegen-typescript-apollo-angular`](./typescript-apollo-angular.md)                                                               |
| `typescript-react-apollo`          | Generate TypeScript types, and React-Apollo Components                                                 | [`@fevo-tech/graphql-codegen-typescript-react-apollo`](./typescript-react-apollo.md)                                                                   |
| `typescript-vue-apollo`            | Generate TypeScript types, and Vue Apollo composition functions                                        | [`@fevo-tech/graphql-codegen-typescript-vue-apollo`](./typescript-vue-apollo.md)                                                                       |
| `typescript-urql`                  | Generate TypeScript types, and Urql Components                                                         | [`@fevo-tech/graphql-codegen-typescript-urql`](./typescript-urql.md)                                                                                   |
| `typescript-graphql-request`       | Generates fully-typed ready-to-use SDK for graphql-request                                             | [`@fevo-tech/graphql-codegen-typescript-graphql-request`](./typescript-graphql-request.md)                                                             |
| `typescript-stencil-apollo`        | Generate TypeScript types, and Stencil Apollo Components                                               | [`@fevo-tech/graphql-codegen-typescript-stencil-apollo`](./typescript-stencil-apollo.md)                                                               |
| `typescript-mongodb`               | Generate Generate server-side TypeScript types, with MongoDB models                                    | [`@fevo-tech/graphql-codegen-typescript-mongodb`](./typescript-mongodb.md)                                                                             |
| `typescript-graphql-files-modules` | Generate `declare module` for `.graphql` files                                                         | [`@fevo-tech/graphql-codegen-typescript-graphql-files-modules`](./typescript-graphql-files-modules.md)                                                 |
| `typescript-document-nodes`        | Generate TypeScript source files files that use `graphql-tag`                                          | [`@fevo-tech/graphql-codegen-typescript-document-nodes`](./typescript-document-nodes.md)                                                               |
| `typescript-type-graphql`          | Generate TypeScript types compatible with TypeGraphQL                                                  | [`@fevo-tech/graphql-codegen-typescript-type-graphql`](./typescript-type-graphql.md)                                                                   |
| `typescript-oclif`                 | Generate commands for oclif command line interfaces                                                    | [`@fevo-tech/graphql-codegen-typescript-oclif`](./typescript-oclif.md)                                                                                 |
| `add`                              | Add any string that you wish to the output file                                                        | [`@fevo-tech/graphql-codegen-add`](./add.md)                                                                                                           |
| `schema-ast`                       | Prints the merged schemas as AST                                                                       | [`@fevo-tech/graphql-codegen-schema-ast`](./schema-ast.md)                                                                                             |
| `fragment-matcher`                 | Generates an introspection result with only Unions and Interfaces                                      | [`@fevo-tech/graphql-codegen-fragment-matcher`](./fragment-matcher.md)                                                                                 |
| `named-operations-object`                 | Generates a type-safe list of all your available GraphQL operations and fragments                                      | [`@fevo-tech/graphql-codegen-named-operations-object`](./named-operations-object.md)                                                                                 |
| `introspection`                    | Generates an introspection result                                                                      | [`@fevo-tech/graphql-codegen-introspection`](./introspection.md)                                                                                       |
| `time`                             | Add the generation time to the output file                                                             | [`@fevo-tech/graphql-codegen-time`](./time.md)                                                                                                         |
| `flow`                             | Generate types for Flow type based on your GraphQL schema                                              | [`@fevo-tech/graphql-codegen-flow`](./flow.md)                                                                                                         |
| `flow-resolvers`                   | Generate resolvers signature for Flow                                                                  | [`@fevo-tech/graphql-codegen-flow-resolvers`](./flow-resolvers.md)                                                                                     |
| `flow-operations`                  | Generate types for Flow type based on your GraphQL operations                                          | [`@fevo-tech/graphql-codegen-flow-operations`](./flow-operations.md)                                                                                   |
| `reason-client`                    | Generate ReasonML types based on your GraphQL schema for use in a client application                   | [`@fevo-tech/graphql-codegen-reason-client`](./reason-client.md)                                                                                       |
| `kotlin`                           | generates Kotlin backend `classes` for Enums and Input types                                           | [`@fevo-tech/graphql-codegen-kotlin`](./kotlin.md)                                                                                                     |
| `java`                             | generates Java backend `classes` for Enums and Input types                                             | [`@fevo-tech/graphql-codegen-java`](./java.md)                                                                                                         |
| `java-resolvers`                   | generates Java backend resolvers signature                                                             | [`@fevo-tech/graphql-codegen-java-resolvers`](./java-resolvers.md)                                                                                     |
| `java-apollo-android`              | generates Apollo Android parsers and mappers                                                           | [`@fevo-tech/graphql-codegen-java-apollo-android`](./java-apollo-android.md)                                                                           |
| Scala Plugins                      | generates types for schema and operations, maintained by [`aappddeevv`](https://github.com/aappddeevv) | [`@aappddeevvv/graphql-code-scala-operations`,`@aappddeevvv/graphql-code-scala-schema`](https://github.com/aappddeevv/graphql-codegen-scala) |
| `apollo-typed-documents`           | Generates `declare module` for `.graphql` files with generic `TypedDocumentNode<TVariables, TData>`. Also generates helper function to create mocks for Apollo Client `MockedProvider`. Maintained by [`rubengrill`](https://github.com/rubengrill/apollo-typed-documents) | [`apollo-typed-documents/lib/codegenTypedDocuments`,`apollo-typed-documents/lib/codegenApolloMock`](https://github.com/rubengrill/apollo-typed-documents) |

In addition, you can build your own code generating plugins based on your specific needs. For more information, check [this doc page](../custom-codegen/index).

## How to use Plugins

To use a plugin, install its package from `npm`, then add it to your YML config file:

```yml
schema: my-schema.graphql
generates:
  output.ts:
    - plugin-name-here
```

## Configure Plugins

To pass configuration to a plugin, do the following:

```yml
schema: my-schema.graphql
generates:
  output.ts:
    - plugin-name-here:
        configKey: configValue
```

You can also pass the same configuration value to multiple plugins:

```yml
schema: my-schema.graphql
generates:
  output.ts:
    config:
      configKey: configValue
    plugins:
      - plugin1-name-here
      - plugin2-name-here
```

You can find the supported configuration for each plugin in its page / `README` file.
