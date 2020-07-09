This plugin generates a GraphQL introspection file based on your GraphQL schema.

## Installation

:::shell Using `yarn`

    $ yarn add -D @fevo-tech/graphql-codegen-introspection

:::

## API Reference

### `minify`

type: `boolean`
default: `false`

Set to `true` in order to minify the JSON output.

#### Usage Examples

```yml
generates:
introspection.json:
  plugins:
    - introspection
  config:
    minify: true
```

### `federation`

type: `boolean`

