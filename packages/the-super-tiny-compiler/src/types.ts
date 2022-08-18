export enum TokenType {
  Paren = 'paren',
  Name = 'name',
  Number = 'number',
  String = 'string',
}

export interface Token {
  type: TokenType;
  value: string;
}

export enum TAstElementType {
  Program = 'Program',
  NumberLiteral = 'NumberLiteral',
  StringLiteral = 'StringLiteral',
  CallExpression = 'CallExpression',
  Identifier = 'Identifier',
  ExpressionStatement = 'ExpressionStatement',
}

export interface TAstElement {
  type: string;
  name?: string;
  value?: string;
  params?: TAstElement[];
  body?: any;
  _context?: any;
}

export interface TAstProgram<T> {
  type: string;
  body: T[];
  params?: TAstElement[];
  _context?: any;
}

export type TAst = TAstProgram<TAstElement>;

export interface TCommonAstElementLiteral {
  type: TAstElementType.NumberLiteral | TAstElementType.StringLiteral;
  value: string;
}

export interface TAstElementCallExpression {
  type: TAstElementType.CallExpression | TAstElementType.ExpressionStatement;
  expression: TAstElementCallExpression;
  callee?: {
    type?: TAstElementType.Identifier;
    name?: string;
  },
  arguments?: (TAstElementCallExpression | TCommonAstElementLiteral)[];
}

export interface TAstElementExpression {
  type: TAstElementType.ExpressionStatement;
  expression: TAstElementCallExpression;
}

export type TNewAst = TAstProgram<TAstElementExpression>;

export interface TVisitor {
  [key: string]: {
    enter(node: TAstElement, parent?: TAstElement): void;
    exit?(node: TAstElement, parent?: TAstElement): void;
  };
}
