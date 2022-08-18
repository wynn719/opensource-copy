import {
  TAst,
  TAstElement,
  TAstElementType,
  TAstProgram,
  TNewAst,
  Token,
  TokenType,
  TVisitor
} from './types'

/**
 * Tokenizer
 * Take a string of code and break it down into an array of tokens
 * e.g. (add 2 (subtract 4 2))   =>   [{ type: 'paren', value: '(' }, ...]
 * @param input
 * @returns
 */
export function tokenizer (input: string) {
  const tokens: Token[] = []
  let current = 0

  while (current < input.length) {
    let char = input[current]

    if (char === '(' || char === ')') {
      tokens.push({
        type: TokenType.Paren,
        value: char
      })
      current++
      continue
    }

    const WHITESPACE = /\s/
    if (WHITESPACE.test(char)) {
      current++
      continue
    }

    const NUMBER = /[0-9]/
    if (NUMBER.test(char)) {
      let value = ''

      while (NUMBER.test(char)) {
        value += char
        current++
        char = input[current]
      }

      tokens.push({
        type: TokenType.Number,
        value
      })
      continue
    }

    if (char === '"') {
      let value = ''

      current++
      char = input[current]

      while (char !== '"') {
        current++
        char = input[current]
        value += char
      }

      tokens.push({
        type: TokenType.String,
        value
      })
    }

    const LETTERS = /[a-z]/i

    if (LETTERS.test(char)) {
      let value = ''

      while (LETTERS.test(char)) {
        value += char
        current++
        char = input[current]
      }

      tokens.push({
        type: TokenType.Name,
        value
      })
      continue
    }
  }

  return tokens
}

/**
 * Parser
 * Take an array of tokens and turn it into an AST, the AST struct is base on your define.
 * @param tokens
 * @returns
 */
export function parser (tokens: Token[]): TAst {
  const root: TAstProgram<TAstElement> = {
    type: 'Program',
    body: []
  }
  let current = 0

  function walk () {
    let token = tokens[current]

    if (token.type === TokenType.Number) {
      current++

      return {
        type: TAstElementType.NumberLiteral,
        value: token.value
      }
    }

    if (token.type === TokenType.String) {
      current++

      return {
        type: TAstElementType.StringLiteral,
        value: token.value
      }
    }

    if (token.type === TokenType.Paren && token.value === '(') {
      current++
      token = tokens[current]

      const node: TAstElement = {
        type: TAstElementType.CallExpression,
        name: token.value,
        params: []
      }

      current++
      token = tokens[current]

      while (
        token.type !== TokenType.Paren ||
        (token.type === TokenType.Paren && token.value !== ')')
      ) {
        node.params?.push(walk())
        token = tokens[current]
      }

      current++

      return node
    }

    throw new TypeError(token.type)
  }

  while (current < tokens.length) {
    root.body.push(walk())
  }

  return root
}

/**
 * Traverser
 * This traverser function is use for transfomer, it accepts an AST and a visitor,
 * It‘s a good design, context, enter, exit, like an interceptor.
 * @param ast
 * @param visitor
 * @returns
 */
export function traverser (
  ast: TAst,
  visitor: TVisitor
): void {
  function traverserArray (array: TAstElement[], parent?: TAstElement) {
    array.forEach((child) => {
      traverserNode(child, parent)
    })
  }

  function traverserNode (
    node: TAstElement | TAstProgram<TAstElement>,
    parent?: TAstElement
  ) {
    const methods = visitor[node.type]

    if (methods && methods.enter) {
      methods.enter(node, parent)
    }

    switch (node.type) {
      case 'Program':
        traverserArray(node.body, node)
        break
      case TAstElementType.CallExpression:
        traverserArray(node.params, node)
        break
      case TAstElementType.NumberLiteral:
      case TAstElementType.StringLiteral:
        break
      default:
        throw new TypeError(node.type)
    }

    if (methods?.exit) {
      methods.exit(node, parent)
    }
  }

  traverserNode(ast)
}

/**
 * Transformer
 * It turns AST into new AST, new AST is used for new code.
 * @param ast
 * @returns
 */
export function transformer (
  ast: TAst
): TNewAst {
  const newAst: TNewAst = {
    type: 'Program',
    body: []
  }

  // 这里很绕，但是可以理解为每个节点的 _context 就是新的 ast 节点的 body 或者 arguments
  ast._context = newAst.body

  traverser(ast, {
    [TAstElementType.NumberLiteral]: {
      enter (node, parent) {
        // 这个 context 也是 CallExpression 的 arguments
        parent?._context.push({
          type: TAstElementType.NumberLiteral,
          value: node.value
        })
      },
      exit () {

      }
    },

    [TAstElementType.StringLiteral]: {
      enter (node, parent) {
        // 这个 context 也是 CallExpression 的 arguments
        parent?._context.push({
          type: TAstElementType.StringLiteral,
          value: node.value
        })
      }
    },

    [TAstElementType.CallExpression]: {
      enter (node, parent) {
        let expression: any = {
          type: TAstElementType.CallExpression,
          callee: {
            type: TAstElementType.Identifier,
            name: node.name
          },
          arguments: []
        }

        node._context = expression.arguments // 指向新节点的 arguments

        if (parent?.type !== TAstElementType.CallExpression) {
          expression = {
            type: TAstElementType.ExpressionStatement,
            expression
          }
        }

        parent?._context.push(expression)
      }
    }
  })

  return newAst
}

/**
 * Generator
 * generate new code string
 * @param ast
 * @returns
 */
export function codeGenerator (
  node: any
): string {
  switch (node.type) {
    case TAstElementType.Program:
      return node.body.map(codeGenerator).join('\n')
    case TAstElementType.ExpressionStatement:
      return codeGenerator(node.expression) + ';'
    case TAstElementType.CallExpression:
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator).join(', ') +
        ')'
      )
    case TAstElementType.Identifier:
      return node.name
    case TAstElementType.NumberLiteral:
      return node.value
    case TAstElementType.StringLiteral:
      return '"' + node.value + '"'

    default:
      throw new TypeError(node.type)
  }
}

/**
 * Compiler
 * Full compiler
 * @param input
 * @returns
 */
export function compiler (input: string): string {
  const tokens = tokenizer(input)
  const ast = parser(tokens)
  const newAst = transformer(ast)
  const output = codeGenerator(newAst)

  return output
}
