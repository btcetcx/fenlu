# ERP Console Preview

## How to preview

1. Unzip this package.
2. Open a terminal in `project/ui_kits/erp-console`.
3. Run:

```bash
python3 -m http.server 4174
```

4. Open this URL in a browser:

```text
http://localhost:4174/
```

## Windows note

If Python is installed on the work computer, you can also open Command Prompt in the `erp-console` folder and run:

```bat
python -m http.server 4174
```

Then open:

```text
http://localhost:4174/
```

If port 4174 is occupied, change it to another port, for example `5188`.

## Important

Do not double-click `index.html` directly. Use a local static server, otherwise the browser may block local script loading.
