import {
  tokenizer,
  parser,
  codeGenerator,
  compiler,
  transformer,
  TokenType,
  TAstElementType,
  Token
} from '~/'

const input = '(add 2 (subtract 4 2))'
const output = 'add(2, subtract(4, 2));'

const tokens: Token[] = [
  { type: TokenType.Paren, value: '(' },
  { type: TokenType.Name, value: 'add' },
  { type: TokenType.Number, value: '2' },
  { type: TokenType.Paren, value: '(' },
  { type: TokenType.Name, value: 'subtract' },
  { type: TokenType.Number, value: '4' },
  { type: TokenType.Number, value: '2' },
  { type: TokenType.Paren, value: ')' },
  { type: TokenType.Paren, value: ')' }
]

const ast = {
  type: 'Program',
  body: [
    {
      type: TAstElementType.CallExpression,
      name: 'add',
      params: [
        {
          type: TAstElementType.NumberLiteral,
          value: '2'
        },
        {
          type: TAstElementType.CallExpression,
          name: 'subtract',
          params: [
            {
              type: TAstElementType.NumberLiteral,
              value: '4'
            },
            {
              type: TAstElementType.NumberLiteral,
              value: '2'
            }
          ]
        }
      ]
    }
  ]
}

const newAst = {
  type: 'Program',
  body: [
    {
      type: TAstElementType.ExpressionStatement,
      expression: {
        type: TAstElementType.CallExpression,
        callee: {
          type: TAstElementType.Identifier,
          name: 'add'
        },
        arguments: [
          {
            type: TAstElementType.NumberLiteral,
            value: '2'
          },
          {
            type: TAstElementType.CallExpression,
            callee: {
              type: TAstElementType.Identifier,
              name: 'subtract'
            },
            arguments: [
              {
                type: TAstElementType.NumberLiteral,
                value: '4'
              },
              {
                type: TAstElementType.NumberLiteral,
                value: '2'
              }
            ]
          }
        ]
      }
    }
  ]
}

describe('Test Compiler', () => {
  test('Tokenizer should turn `input` string into `tokens` array', () => {
    expect(tokenizer(input)).toStrictEqual(tokens)
  })

  test('Parser should turn `tokens` array into `ast`', () => {
    expect(parser(tokens)).toStrictEqual(ast)
  })

  test('Transformer should turn `ast` into a `newAst`', () => {
    expect(transformer(ast)).toStrictEqual(newAst)
  })

  test('Code Generator should turn `newAst` into `output` string', () => {
    expect(codeGenerator(newAst)).toBe(output)
  })

  test('Compiler should turn `input` into `output`', () => {
    expect(compiler(input)).toBe(output)
  })
})
