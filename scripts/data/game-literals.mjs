import fs from "node:fs";
import ts from "typescript";

// Parse data declarations only. Never import, eval or run the supplied game.
export function gameLiterals(file) {
  const code = fs.readFileSync(file, "utf8");
  const ast = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const nodes = new Map();
  function scan(n) {
    if (ts.isVariableDeclaration(n) && n.initializer)
      nodes.set(n.name.getText(ast), n.initializer);
    if (
      ts.isBinaryExpression(n) &&
      n.operatorToken.kind === ts.SyntaxKind.EqualsToken
    )
      nodes.set(n.left.getText(ast), n.right);
    ts.forEachChild(n, scan);
  }
  scan(ast);
  function value(n, depth = 0) {
    if (!n || depth > 16) return undefined;
    const read = (node) => value(node, depth + 1);
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
      return n.text;
    if (ts.isNumericLiteral(n)) return Number(n.text);
    if (n.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (n.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (n.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isIdentifier(n)) return read(nodes.get(n.text));
    if (ts.isArrayLiteralExpression(n)) return n.elements.map(read);
    if (ts.isNewExpression(n) && n.expression.getText(ast) === "Set")
      return read(n.arguments?.[0]);
    if (ts.isPrefixUnaryExpression(n))
      return n.operator === ts.SyntaxKind.MinusToken
        ? -read(n.operand)
        : read(n.operand);
    if (ts.isObjectLiteralExpression(n))
      return Object.fromEntries(
        n.properties.flatMap((p) => {
          if (!ts.isPropertyAssignment(p)) return [];
          const v = read(p.initializer);
          return v === undefined ? [] : [[p.name.text, v]];
        }),
      );
    if (ts.isBinaryExpression(n)) {
      const a = read(n.left),
        b = read(n.right);
      if (typeof a === "number" && typeof b === "number") {
        if (n.operatorToken.kind === ts.SyntaxKind.SlashToken) return a / b;
        if (n.operatorToken.kind === ts.SyntaxKind.AsteriskToken) return a * b;
      }
    }
    return undefined;
  }
  return {
    get(name) {
      const result = value(nodes.get(name));
      if (result === undefined)
        throw new Error(`${file}: missing literal ${name}`);
      return result;
    },
    dictionary() {
      let result = {};
      function visit(n) {
        if (
          ts.isCallExpression(n) &&
          n.expression.getText(ast) === "G.I18n.add"
        )
          result = { ...result, ...value(n.arguments[0]) };
        ts.forEachChild(n, visit);
      }
      visit(ast);
      return result;
    },
  };
}
