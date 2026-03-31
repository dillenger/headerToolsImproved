# Development

## Lint

```
npx eslint@10 .
```

## Format

```
npx prettier --write "**/*.{js,mjs,json,css,html}"
```

Vendored files in `vendor/` and `api/` are excluded via `.prettierignore`.

## Build XPI

```
zip -r ../header_tools_improved.xpi . -x ".prettierignore" "eslint.config.mjs" "node_modules/*"
```
