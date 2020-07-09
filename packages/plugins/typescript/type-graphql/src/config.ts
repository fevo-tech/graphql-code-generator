import { DecoratorConfig } from './visitor';
import { TypeScriptPluginConfig } from '@fevo-tech/graphql-codegen-typescript';

export interface TypeGraphQLPluginConfig extends TypeScriptPluginConfig {
  decoratorName?: Partial<DecoratorConfig>;
}
