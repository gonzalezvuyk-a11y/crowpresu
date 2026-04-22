import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(process.cwd());
const tokensPath = path.join(rootDir, "tokens.json");
const outputPath = path.join(rootDir, "design-system.css");

const source = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

const namespacePrefixes = {
  tokens: "",
  semantic: "semantic-",
  components: "component-",
};

function toCssVarName(namespace, parts) {
  const prefix = namespacePrefixes[namespace];
  if (prefix === undefined) {
    throw new Error(`Unknown token namespace: ${namespace}`);
  }

  return `--${prefix}${parts.join("-")}`;
}

function resolveReferences(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/\{([a-z0-9.-]+)\}/gi, (_, ref) => {
    const [namespace, ...parts] = ref.split(".");
    return `var(${toCssVarName(namespace, parts)})`;
  });
}

function flattenTokens(namespace, value, prefix = []) {
  if (typeof value === "string") {
    return [[toCssVarName(namespace, prefix), resolveReferences(value)]];
  }

  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    "value" in value
  ) {
    return [[toCssVarName(namespace, prefix), resolveReferences(value.value)]];
  }

  return Object.entries(value).flatMap(([key, nested]) =>
    flattenTokens(namespace, nested, [...prefix, key]),
  );
}

function formatDeclarations(declarations) {
  return Object.entries(declarations)
    .map(([property, value]) => `  ${property}: ${resolveReferences(value)};`)
    .join("\n");
}

const tokenGroups = [
  ["tokens", source.tokens ?? {}],
  ["semantic", source.semantic ?? {}],
  ["components", source.components ?? {}],
];

const fontFaces = (source.fonts ?? [])
  .map(
    ({ family, src, weight, style, display = "swap" }) =>
      `@font-face {\n  font-family: "${family}";\n  src: url("${src}") format("truetype");\n  font-weight: ${weight};\n  font-style: ${style};\n  font-display: ${display};\n}`,
  )
  .join("\n\n");

const tokenSections = tokenGroups
  .map(([namespace, values]) => {
    const lines = flattenTokens(namespace, values).map(
      ([name, value]) => `  ${name}: ${value};`,
    );

    if (lines.length === 0) {
      return "";
    }

    return `  /* ${namespace} */\n${lines.join("\n")}`;
  })
  .filter(Boolean);

const aliasLines = Object.entries(source.aliases).map(
  ([name, value]) => `  --${name}: ${resolveReferences(value)};`,
);

const rules = source.rules
  .map(({ selectors, declarations }) => {
    const selectorText = selectors.join(",\n");
    return `${selectorText} {\n${formatDeclarations(declarations)}\n}`;
  })
  .join("\n\n");

const css = `/* Generated from tokens.json. Run: node scripts/build-design-system.mjs */\n\n${fontFaces ? `${fontFaces}\n\n` : ""}:root {\n${tokenSections.join("\n\n")}\n\n  /* Backwards-compatible aliases used by the current HTML files. */\n${aliasLines.join("\n")}\n}\n\n${rules}\n`;

fs.writeFileSync(outputPath, css);
console.log(`Generated ${path.relative(rootDir, outputPath)} from ${path.relative(rootDir, tokensPath)}`);
