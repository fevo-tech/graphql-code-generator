import { TypeScriptOperationVariablesToObject as TSOperationVariablesToObject } from '@fevo-tech/graphql-codegen-typescript';

export class TypeScriptOperationVariablesToObject extends TSOperationVariablesToObject {
  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    return fieldType;
  }
}
