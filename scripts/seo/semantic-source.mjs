import ts from "typescript";

// Normalize syntax rather than hashing formatting, style classes or comments.
export function semanticSource(text, file) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const transformed = ts.transform(source, [context => node => {
    const visit = child => {
      if ((ts.isImportDeclaration(child) || ts.isExportDeclaration(child)) && child.moduleSpecifier?.text.endsWith(".css")) return undefined;
      if (ts.isStringLiteral(child)) return context.factory.createStringLiteral(child.text);
      if (ts.isJsxAttribute(child) && ["className", "style"].includes(child.name.getText(source))) return undefined;
      if (ts.isJsxText(child)) return context.factory.createJsxText(child.text.replace(/\s+/g, " ").trim(), false);
      if (file.endsWith("SiteFooter.tsx") && ts.isVariableDeclaration(child) && child.name.getText(source) === "year") return context.factory.updateVariableDeclaration(child, child.name, child.exclamationToken, child.type, context.factory.createIdentifier("CURRENT_YEAR"));
      return ts.visitEachChild(child, visit, context);
    };
    return ts.visitNode(node, visit);
  }]);
  try { return ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed }).printFile(transformed.transformed[0]); }
  finally { transformed.dispose(); }
}
