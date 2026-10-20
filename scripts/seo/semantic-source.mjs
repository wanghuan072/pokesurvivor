import ts from "typescript";

// Normalize syntax rather than hashing formatting, style classes or comments.
export function semanticSource(text, file, selectedFunctions) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  if (selectedFunctions) {
    selectedFunctions = new Set(selectedFunctions);
    const functions = new Map(source.statements.filter(ts.isFunctionDeclaration).filter(node=>node.name).map(node=>[node.name.text,node]));
    const pending = [...selectedFunctions];
    for (const name of pending) {
      const collect = node => {
        if (ts.isIdentifier(node) && functions.has(node.text) && !selectedFunctions.has(node.text)) {
          selectedFunctions.add(node.text); pending.push(node.text);
        }
        ts.forEachChild(node,collect);
      };
      if (functions.has(name)) collect(functions.get(name));
    }
  }
  const transformed = ts.transform(source, [context => node => {
    const visit = child => {
      if (ts.isInterfaceDeclaration(child) || ts.isTypeAliasDeclaration(child)) return undefined;
      if (ts.isImportDeclaration(child) && child.importClause?.isTypeOnly) return undefined;
      if (selectedFunctions && ts.isFunctionDeclaration(child) && child.name && !selectedFunctions.has(child.name.text)) return undefined;
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
