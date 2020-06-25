import '@graphql-codegen/testing';
import { parse } from 'graphql';
import { codegen } from '@graphql-codegen/core';
import { plugin } from '../src';
import { TypeScriptResolversPluginConfig } from '../src/config';

function generate({ schema, config }: { schema: string; config: TypeScriptResolversPluginConfig }) {
  return codegen({
    filename: 'graphql.ts',
    schema: parse(schema),
    documents: [],
    plugins: [
      {
        'typescript-resolvers': {},
      },
    ],
    config,
    pluginMap: {
      'typescript-resolvers': {
        plugin,
      },
    },
  });
}

describe('TypeScript Resolvers Plugin + Apollo Federation', () => {
  it('should add __resolveReference to objects that have @key', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        allUsers: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & Pick<ParentType, 'id'>, ContextType>;
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content).not.toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Book']>, ParentType, ContextType>;
    `);
  });

  it('should support extend keyword', async () => {
    const federatedSchema = /* GraphQL */ `
      extend type Query {
        allUsers: [User]
      }

      extend type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & Pick<ParentType, 'id'>, ContextType>;
    `);
    // Foo shouldn't because it doesn't have @key
    expect(content).not.toBeSimilarStringTo(`
      __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Book']>, ParentType, ContextType>;
    `);
  });

  it('should include fields from @requires directive', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String @external
        age: Int! @external
        username: String @requires(fields: "name age")
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & Pick<ParentType, 'id'>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);
  });

  it('should skip to generate resolvers of fields with @external directive', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type Book {
        author: User @provides(fields: "name")
      }

      type User @key(fields: "id") {
        id: ID!
        name: String @external
        username: String @external
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // UserResolver should not have a resolver function of name field
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & Pick<ParentType, 'id'>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);
  });

  it('should not include _FieldSet scalar', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).not.toMatch(`_FieldSet`);
  });

  it('should not include federation directives', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).not.toMatch('ExternalDirectiveResolver');
    expect(content).not.toMatch('RequiresDirectiveResolver');
    expect(content).not.toMatch('ProvidesDirectiveResolver');
    expect(content).not.toMatch('KeyDirectiveResolver');
  });

  it('should not add directive definitions and scalars if they are already there', async () => {
    const federatedSchema = /* GraphQL */ `
      scalar _FieldSet

      directive @key(fields: _FieldSet!) on OBJECT | INTERFACE

      type Query {
        allUsers: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).not.toMatch(`_FieldSet`);
    expect(content).not.toMatch('ExternalDirectiveResolver');
    expect(content).not.toMatch('RequiresDirectiveResolver');
    expect(content).not.toMatch('ProvidesDirectiveResolver');
    expect(content).not.toMatch('KeyDirectiveResolver');
  });

  it('should allow for duplicated directives', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        allUsers: [User]
      }

      type User @key(fields: "id") @key(fields: "name") {
        id: ID!
        name: String
        username: String
      }

      type Book {
        id: ID!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & (Pick<ParentType, 'id'> | Pick<ParentType, 'name'>), ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);
  });

  it.skip('should only extend an original type by a mapped type', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        users: [User]
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
        age: Int!
        username: String
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
        mappers: {
          User: 'UserExtension',
        },
      },
    });

    // User should have it
    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & Pick<ParentType, 'id'>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], UserExtension & ParentType, ContextType>;
        username?: Resolver<Maybe<ResolversTypes['String']>, UserExtension & ParentType & Pick<ParentType, 'name', 'age'>, ContextType>;
      };
    `);
  });

  it('should not generate unused scalars', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        user(id: ID!): User!
      }

      type User {
        id: ID!
        username: String!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    // no GraphQLScalarTypeConfig
    expect(content).not.toContain('GraphQLScalarTypeConfig');
    // no GraphQLScalarType
    expect(content).not.toContain('GraphQLScalarType');
  });

  describe('When there are inner fields used in @key directive', () => {
    it('should change parent type and extract one inner field', async () => {
      const federatedSchema = /* GraphQL */ `
        type Person {
          id: ID!
        }

        type User @key(fields: "person { id }") {
          person: Person!
        }
      `;

      const content = await generate({
        schema: federatedSchema,
        config: {
          federation: true,
        },
      });

      expect(content).toBeSimilarStringTo(`
        export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
          __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & Pick<ParentType['person'], 'id'>, ContextType>;
          person?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
          __isTypeOf?: IsTypeOfResolverFn<ParentType>;
        };
      `);
    });

    it('should change parent type and extract several inner fields', async () => {
      const federatedSchema = /* GraphQL */ `
        type Person {
          id: ID!
          personalId: ID!
        }

        type User @key(fields: "person { id personalId }") {
          person: Person!
        }
      `;

      const content = await generate({
        schema: federatedSchema,
        config: {
          federation: true,
        },
      });

      expect(content).toBeSimilarStringTo(`
        export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
          __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & Pick<ParentType['person'], 'id' | 'personalId'>, ContextType>;
          person?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
          __isTypeOf?: IsTypeOfResolverFn<ParentType>;
        };
      `);
    });

    it('should change parent type and extract one inner field given duplicate @key directive', async () => {
      const federatedSchema = /* GraphQL */ `
        type Author {
          id: ID!
        }

        type Publisher {
          id: ID!
        }

        type Book @key(fields: "author { id }") @key(fields: "publisher { id }") {
          author: Author!
          publisher: Publisher!
        }
      `;

      const content = await generate({
        schema: federatedSchema,
        config: {
          federation: true,
        },
      });

      expect(content).toBeSimilarStringTo(`
        export type BookResolvers<ContextType = any, ParentType extends ResolversParentTypes['Book'] = ResolversParentTypes['Book']> = {
          __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Book']>, { __typename: 'Book' } & (Pick<ParentType['author'], 'id'> | Pick<ParentType['publisher'], 'id'>), ContextType>;
          author?: Resolver<ResolversTypes['Author'], ParentType, ContextType>;
          publisher?: Resolver<ResolversTypes['Publisher'], ParentType, ContextType>;
          __isTypeOf?: IsTypeOfResolverFn<ParentType>;
        };
      `);
    });

    it('should change parent type and extract several inner fields given duplicate @key directive', async () => {
      const federatedSchema = /* GraphQL */ `
        type Author {
          id: ID!
          writerAssocId: ID!
        }

        type Publisher {
          id: ID!
          publisherAssocId: ID!
        }

        type Book @key(fields: "author { id writerAssocId }") @key(fields: "publisher { id publisherAssocId }") {
          author: Author!
          publisher: Publisher!
        }
      `;

      const content = await generate({
        schema: federatedSchema,
        config: {
          federation: true,
        },
      });

      expect(content).toBeSimilarStringTo(`
        export type BookResolvers<ContextType = any, ParentType extends ResolversParentTypes['Book'] = ResolversParentTypes['Book']> = {
          __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Book']>, { __typename: 'Book' } & (Pick<ParentType['author'], 'id' | 'writerAssocId'> | Pick<ParentType['publisher'], 'id' | 'publisherAssocId'>), ContextType>;
          author?: Resolver<ResolversTypes['Author'], ParentType, ContextType>;
          publisher?: Resolver<ResolversTypes['Publisher'], ParentType, ContextType>;
          __isTypeOf?: IsTypeOfResolverFn<ParentType>;
        };
      `);
    });

    it('should throw error when several parents are used in the @key directive', async () => {
      const federatedSchema = /* GraphQL */ `
        type Author {
          id: ID!
        }

        type Publisher {
          id: ID!
        }

        type Book @key(fields: "author { id } publisher { id }") {
          author: Author!
          publisher: Publisher!
        }
      `;

      await expect(
        generate({
          schema: federatedSchema,
          config: {
            federation: true,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('When field definition wrapping is enabled', () => {
    it('should add the UnwrappedObject type', async () => {
      const federatedSchema = /* GraphQL */ `
        type User @key(fields: "id") {
          id: ID!
        }
      `;

      const content = await generate({
        schema: federatedSchema,
        config: {
          federation: true,
          wrapFieldDefinitions: true,
        },
      });

      expect(content).toBeSimilarStringTo(`type UnwrappedObject<T> = {`);
    });

    it('should add UnwrappedObject around ParentType for __resloveReference', async () => {
      const federatedSchema = /* GraphQL */ `
        type User @key(fields: "id") {
          id: ID!
        }
      `;

      const content = await generate({
        schema: federatedSchema,
        config: {
          federation: true,
          wrapFieldDefinitions: true,
        },
      });

      // __resolveReference should be unwrapped
      expect(content).toBeSimilarStringTo(`{ __typename: 'User' } & Pick<UnwrappedObject<ParentType>, 'id'>`);
      // but ID should not
      expect(content).toBeSimilarStringTo(`id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>`);
    });
  });
});
