import {
  GraphQLSchema,
  parse,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  DirectiveNode,
  StringValueNode,
  GraphQLObjectType,
  isObjectType,
  isNonNullType,
  GraphQLNamedType,
  printType,
  Kind,
} from 'graphql';
import { getBaseType } from './utils';

interface FieldSetItem {
  name: string;
  required: boolean;
}

/**
 * Federation Spec
 */
export const federationSpec = parse(/* GraphQL */ `
  scalar _FieldSet

  directive @external on FIELD_DEFINITION
  directive @requires(fields: _FieldSet!) on FIELD_DEFINITION
  directive @provides(fields: _FieldSet!) on FIELD_DEFINITION
  directive @key(fields: _FieldSet!) on OBJECT | INTERFACE
`);

/**
 * Adds `__resolveReference` in each ObjectType involved in Federation.
 * @param schema
 */
export function addFederationReferencesToSchema(schema: GraphQLSchema): GraphQLSchema {
  const typeMap = schema.getTypeMap();
  for (const typeName in typeMap) {
    const type = schema.getType(typeName);
    if (isObjectType(type) && isFederationObjectType(type)) {
      const typeConfig = type.toConfig();
      typeConfig.fields = {
        [resolveReferenceFieldName]: {
          type,
        },
        ...typeConfig.fields,
      };

      const newType = new GraphQLObjectType(typeConfig);
      newType.astNode = newType.astNode || (parse(printType(newType)).definitions[0] as ObjectTypeDefinitionNode);
      (newType.astNode.fields as FieldDefinitionNode[]).unshift({
        kind: Kind.FIELD_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: resolveReferenceFieldName,
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: typeName,
          },
        },
      });
      typeMap[typeName] = newType;
    }
  }

  return schema;
}

/**
 * Removes Federation Spec from GraphQL Schema
 * @param schema
 * @param config
 */
export function removeFederation(schema: GraphQLSchema): GraphQLSchema {
  const queryType = schema.getQueryType();
  const queryTypeFields = queryType.getFields();
  delete queryTypeFields._entities;
  delete queryTypeFields._service;

  const typeMap = schema.getTypeMap();
  delete typeMap._Service;
  delete typeMap._Entity;
  delete typeMap._Any;

  return schema;
}

const resolveReferenceFieldName = '__resolveReference';

type ExtractFieldSetResult = {
  parentTypeRef?: string;
  fieldSet: string[];
};

export class ApolloFederation {
  private enabled = false;
  private schema: GraphQLSchema;
  private providesMap: Record<string, string[]>;

  constructor({ enabled, schema }: { enabled: boolean; schema: GraphQLSchema }) {
    this.enabled = enabled;
    this.schema = schema;
    this.providesMap = this.createMapOfProvides();
  }

  /**
   * Excludes types definde by Federation
   * @param typeNames List of type names
   */
  filterTypeNames(typeNames: string[]): string[] {
    return this.enabled ? typeNames.filter(t => t !== '_FieldSet') : typeNames;
  }

  /**
   * Excludes `__resolveReference` fields
   * @param fieldNames List of field names
   */
  filterFieldNames(fieldNames: string[]): string[] {
    return this.enabled ? fieldNames.filter(t => t !== resolveReferenceFieldName) : fieldNames;
  }

  /**
   * Decides if directive should not be generated
   * @param name directive's name
   */
  skipDirective(name: string): boolean {
    return this.enabled && ['external', 'requires', 'provides', 'key'].includes(name);
  }

  /**
   * Decides if scalar should not be generated
   * @param name directive's name
   */
  skipScalar(name: string): boolean {
    return this.enabled && name === '_FieldSet';
  }

  /**
   * Decides if field should not be generated
   * @param data
   */
  skipField({ fieldNode, parentType }: { fieldNode: FieldDefinitionNode; parentType: GraphQLNamedType }): boolean {
    if (!this.enabled || !isObjectType(parentType) || !isFederationObjectType(parentType)) {
      return false;
    }

    return this.isExternalAndNotProvided(fieldNode, parentType);
  }

  isResolveReferenceField(fieldNode: FieldDefinitionNode): boolean {
    const name = typeof fieldNode.name === 'string' ? fieldNode.name : fieldNode.name.value;
    return this.enabled && name === resolveReferenceFieldName;
  }

  /**
   * Transforms ParentType signature in ObjectTypes involved in Federation
   * @param data
   */
  transformParentType({
    fieldNode,
    parentType,
    parentTypeSignature,
  }: {
    fieldNode: FieldDefinitionNode;
    parentType: GraphQLNamedType;
    parentTypeSignature: string;
  }) {
    if (
      this.enabled &&
      isObjectType(parentType) &&
      isFederationObjectType(parentType) &&
      fieldNode.name.value === resolveReferenceFieldName
    ) {
      const keys = getDirectivesByName('key', parentType);

      if (keys.length) {
        const outputs: string[] = [`{ __typename: '${parentType.name}' } &`];

        // Look for @requires and see what the service needs and gets
        const requires = getDirectivesByName('requires', fieldNode)
          .map(dn => this.extractFieldSet(dn).fieldSet)
          .reduce((prev, curr) => [...prev, ...curr], [])
          .map(name => {
            return { name, required: isNonNullType(parentType.getFields()[name].type) };
          });
        const requiredFields = this.translateFieldSet(requires, parentTypeSignature);

        // @key() @key() - "primary keys" in Federation
        const primaryKeys = keys.map(def => {
          const { parentTypeRef, fieldSet } = this.extractFieldSet(def, parentTypeSignature);
          const fields = fieldSet.map(name => ({ name, required: true }));
          return this.translateFieldSet(fields, parentTypeRef);
        });

        const [open, close] = primaryKeys.length > 1 ? ['(', ')'] : ['', ''];

        outputs.push([open, primaryKeys.join(' | '), close].join(''));

        // include required fields
        if (requires.length) {
          outputs.push(`& ${requiredFields}`);
        }

        return outputs.join(' ');
      }
    }

    return parentTypeSignature;
  }

  private isExternalAndNotProvided(fieldNode: FieldDefinitionNode, objectType: GraphQLObjectType): boolean {
    return this.isExternal(fieldNode) && !this.hasProvides(objectType, fieldNode);
  }

  private isExternal(node: FieldDefinitionNode): boolean {
    return getDirectivesByName('external', node).length > 0;
  }

  private hasProvides(objectType: ObjectTypeDefinitionNode | GraphQLObjectType, node: FieldDefinitionNode): boolean {
    const fields = this.providesMap[isObjectType(objectType) ? objectType.name : objectType.name.value];

    if (fields && fields.length) {
      return fields.includes(node.name.value);
    }

    return false;
  }

  private translateFieldSet(fields: FieldSetItem[], parentTypeRef: string): string {
    // TODO: support other things than fields separated by a whitespace (fields: "fieldA fieldB fieldC")
    const keys = fields.map(field => `'${field.name}'`).join(' | ');
    return `Pick<${parentTypeRef}, ${keys}>`;
  }

  private extractFieldSet(directive: DirectiveNode, parentTypeRef?: string): ExtractFieldSetResult {
    const arg = directive.arguments.find(arg => arg.name.value === 'fields');
    const value = (arg.value as StringValueNode).value;
    const splitValues = value.split(/\s+/g);

    if (/[{}]/gi.test(value)) {
      // TODO quite hacky, assumes that one '{' equals to one parent reference
      if (splitValues.reduce((acc, v) => acc + (/[{]/gi.test(v) ? 1 : 0), 0) > 1) {
        throw new Error(`
          Nested fields in _FieldSet is not supported for several parents. Try using duplicate directives.
          Example: '@key(fields: "entity1 { a }") @key(fields: "entity2 { b }")' instead of '@key(fields: "entity1 { a } entity2 { b }")'. 
        `);
      }
      return {
        parentTypeRef: `${parentTypeRef}['${splitValues.splice(0, 1)}']`,
        fieldSet: deduplicate(splitValues.filter(v => !/[{}]/gi.test(v))),
      };
    }

    return {
      parentTypeRef,
      fieldSet: deduplicate(splitValues),
    };
  }

  private createMapOfProvides() {
    const providesMap: Record<string, string[]> = {};

    Object.keys(this.schema.getTypeMap()).forEach(typename => {
      const objectType = this.schema.getType(typename);

      if (isObjectType(objectType)) {
        Object.values(objectType.getFields()).forEach(field => {
          const provides = getDirectivesByName('provides', field.astNode)
            .map(dn => this.extractFieldSet(dn).fieldSet)
            .reduce((prev, curr) => [...prev, ...curr], []);
          const ofType = getBaseType(field.type);

          if (!providesMap[ofType.name]) {
            providesMap[ofType.name] = [];
          }

          providesMap[ofType.name].push(...provides);
        });
      }
    });

    return providesMap;
  }
}

/**
 * Checks if Object Type is involved in Federation. Based on `@key` directive
 * @param node Type
 */
function isFederationObjectType(node: ObjectTypeDefinitionNode | GraphQLObjectType): boolean {
  const definition = isObjectType(node)
    ? node.astNode || (parse(printType(node)).definitions[0] as ObjectTypeDefinitionNode)
    : node;

  const name = definition.name.value;
  const directives = definition.directives;

  const isNotRoot = !['Query', 'Mutation', 'Subscription'].includes(name);
  const isNotIntrospection = !name.startsWith('__');
  const hasKeyDirective = directives.some(d => d.name.value === 'key');

  return isNotRoot && isNotIntrospection && hasKeyDirective;
}

function deduplicate<T>(items: T[]): T[] {
  return items.filter((item, i) => items.indexOf(item) === i);
}

/**
 * Extracts directives from a node based on directive's name
 * @param name directive name
 * @param node ObjectType or Field
 */
function getDirectivesByName(
  name: string,
  node: ObjectTypeDefinitionNode | GraphQLObjectType | FieldDefinitionNode
): readonly DirectiveNode[] {
  let astNode: ObjectTypeDefinitionNode | FieldDefinitionNode;

  if (isObjectType(node)) {
    astNode = node.astNode;
  } else {
    astNode = node;
  }

  if (astNode && astNode.directives) {
    return astNode.directives.filter(d => d.name.value === name);
  }

  return [];
}
