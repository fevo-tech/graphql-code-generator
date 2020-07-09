import '@fevo-tech/graphql-codegen-testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index';
import { CSharpOperationsRawPluginConfig } from '../src/config';
import { Types } from '@fevo-tech/graphql-codegen-plugin-helpers';

describe('C# Operations', () => {
  describe('Namespaces', () => {
    it('Should wrap generated code block in namespace using default name', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('namespace GraphQLCodeGen {');
    });

    it('Should wrap generated code block in namespace using a custom name', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);
      const config: CSharpOperationsRawPluginConfig = {
        namespaceName: 'MyCompany.MyGeneratedGql',
      };
      const result = (await plugin(schema, [{ location: '', document: operation }], config, {
        outputFile: '',
      })) as Types.ComplexPluginOutput;
      expect(result.content).toContain('namespace MyCompany.MyGeneratedGql {');
    });
  });

  describe('Query', () => {
    it('Should wrap each query operation in a class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
          you: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
        query findYou {
          you
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('public class FindMeGQL {');
      expect(result.content).toContain('public class FindYouGQL {');
    });

    it('Should generate a document string containing original query operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static string FindMeDocument = @"
          query findMe {
            me
          }
        ";
      `);
    });

    it('Should generate request method for each query operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static GraphQLRequest Request(object variables = null) {
          return new GraphQLRequest {
            Query = FindMeDocument,
            OperationName = "findMe",
            Variables = variables
          };
        }
      `);
    });

    it('Should mark original method signature obsolete', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <remark>This method is obsolete. Use Request instead.</remark>
        public static GraphQLRequest getFindMeGQL() {
      `);
    });
  });

  describe('Mutation', () => {
    it('Should wrap each mutation operation in a class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
          you: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
        mutation updateYou {
          you
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('public class UpdateMeGQL {');
      expect(result.content).toContain('public class UpdateYouGQL {');
    });

    it('Should generate a document string containing original mutation operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static string UpdateMeDocument = @"
          mutation updateMe {
            me
          }
        ";
      `);
    });

    it('Should generate request method for each mutation operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static GraphQLRequest Request(object variables = null) {
          return new GraphQLRequest {
            Query = UpdateMeDocument,
            OperationName = "updateMe",
            Variables = variables
          };
        }
      `);
    });

    it('Should mark original method signature obsolete', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <remark>This method is obsolete. Use Request instead.</remark>
        public static GraphQLRequest getUpdateMeGQL() {
      `);
    });
  });

  describe('Subscription', () => {
    it('Should wrap each subscription operation in a class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          you: Int!
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyYou {
          you
        }
        subscription onNotifyThem {
          them
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('public class OnNotifyYouGQL {');
      expect(result.content).toContain('public class OnNotifyThemGQL {');
    });

    it('Should generate a document string containing original subscription operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyThem {
          them
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static string OnNotifyThemDocument = @"
          subscription onNotifyThem {
            them
          }
        ";
      `);
    });

    it('Should generate request method for each subscription operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyThem {
          them
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static GraphQLRequest Request(object variables = null) {
          return new GraphQLRequest {
            Query = OnNotifyThemDocument,
            OperationName = "onNotifyThem",
            Variables = variables
          };
        }
      `);
    });

    it('Should mark original method signature obsolete', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyThem {
          them
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <remark>This method is obsolete. Use Request instead.</remark>
        public static GraphQLRequest getOnNotifyThemGQL() {
      `);
    });
  });

  describe('Fragments', () => {
    it('Should generate request method for each subscription operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: ID!
          username: String!
          email: String!
        }
        type Query {
          user: User!
          allWorking: [User!]
        }
      `);
      const operation = parse(/* GraphQL */ `
        query user {
          user {
            ...UserFields
          }
          allWorking {
            ...UserFields
          }
        }

        fragment UserFields on User {
          id
          username
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('Query = UserDocument');
      expect(result.content).toBeSimilarStringTo(`
        public static string UserDocument = @"
          query user {
            user {
              ...UserFields
            }
            allWorking {
              ...UserFields
            }
          }

          fragment UserFields on User {
            id
            username
          }"
      `);
    });
  });

  describe('Method summary header', () => {
    it('Should generate a summary with required and optional scalar variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          runScalar(
            id: Int
            idr: Int!
            name: String
            namer: String!
            flag: Boolean
            flagr: Boolean!
            flt: Float
            fltr: Float!
          ): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query RunScalar(
          $id: Int
          $idr: Int!
          $name: String
          $namer: String!
          $flag: Boolean
          $flagr: Boolean!
          $flt: Float
          $fltr: Float!
        ) {
          runScalar(id: $id, idr: $idr, name: $name, namer: $namer, flagr: $flagr, flt: $flt, fltr: $fltr)
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <summary>
        /// RunScalarGQL.Request
        /// <para>Required variables:<br/> { idr=(int), namer=(string), flagr=(bool), fltr=(float)  }</para>
        /// <para>Optional variables:<br/> { id=(int), name=(string), flag=(bool), flt=(float) }</para>
        /// </summary>
      `);
    });

    it('Should generate a summary with required and optional for complex variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum SortBy {
          Asc
          Desc
        }
        type Data {
          flag: Boolean
        }
        type Query {
          runComplex(sort: SortBy, complex: Data, arr: [ID!]!): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query RunComplex($sort: SortBy, $complex: Data, $arr: [ID!]!) {
          runComplex(sort: $sort, complex: $complex, arr: $arr)
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <summary>
        /// RunComplexGQL.Request
        /// <para>Required variables:<br/> { arr=(string[]) }</para>
        /// <para>Optional variables:<br/> { sort=(SortBy), complex=(Data) }</para>
        /// </summary>
      `);
    });

    it('Should generate a summary without variables if query does not have variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          runSimple: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query RunSimple {
          runSimple
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <summary>
        /// RunSimpleGQL.Request
        /// </summary>
      `);
    });
  });

  describe('Issues', () => {
    it('#4221 - suffix query mutation subscription', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
        type Mutation {
          you: Int!
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
        mutation updateYou {
          you
        }
        subscription onNotifyThem {
          them
        }
      `);

      const config: CSharpOperationsRawPluginConfig = {
        querySuffix: 'Query',
        mutationSuffix: 'Mutation',
        subscriptionSuffix: 'Subscription',
      };
      const result = (await plugin(schema, [{ location: '', document: operation }], config, {
        outputFile: '',
      })) as Types.ComplexPluginOutput;

      expect(result.content).toContain('public class FindMeQuery {');
      expect(result.content).toContain('public class UpdateYouMutation {');
      expect(result.content).toContain('public class OnNotifyThemSubscription {');

      expect(result.content).toContain('public static GraphQLRequest getFindMeQuery() {');
      expect(result.content).toContain('public static GraphQLRequest getUpdateYouMutation() {');
      expect(result.content).toContain('public static GraphQLRequest getOnNotifyThemSubscription() {');
    });

    it('#4260 - operation name casing', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe1 {
          me
        }
        query FindMe2 {
          me
        }
        query findme3 {
          me
        }
        query FINDME4 {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toContain('OperationName = "findMe1"');
      expect(result.content).toContain('OperationName = "FindMe2"');
      expect(result.content).toContain('OperationName = "findme3"');
      expect(result.content).toContain('OperationName = "FINDME4"');
    });
  });
});
