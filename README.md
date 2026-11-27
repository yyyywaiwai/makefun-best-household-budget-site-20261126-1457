# makefun-best-household-budget-site-20261126-1457
[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/yyyywaiwai/makefun-best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/yyyywaiwai/makefun-best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Maplewood Ledger — a household budget site for the Alvarez family. It keeps income, spending, budgets, savings goals, bills and reports in one place, with real figures in place from the first open and everything saved in the browser's local storage. No account, no server, no network requests.

## Run it

Serve `app/` with any static file server and open `index.html`:

```sh
cd app
python3 -m http.server 8000
# then open http://localhost:8000
```

## Pages

- **Dashboard** — income, spending, what's left, savings rate, spending split, bills coming up, savings goals and plain-language insights.
- **Transactions** — add, edit, delete and filter every entry; download the month as CSV.
- **Budget** — a monthly target per category with progress bars and over/near/on-track markers; targets are editable in place.
- **Goals** — savings goals with progress, monthly amounts and an estimated finish; add money to a goal or start a new one.
- **Bills** — recurring bills, what is still to pay, what is paid, and a day-by-day calendar of when each bill lands.
- **Reports** — income vs spending by month, a month-by-month table, the spending split and a budget scorecard.
- **Settings** — household details, monthly income sources and data tools (CSV/JSON download, reset to the starter figures).

All charts are drawn in code on canvas. The site works on a desktop and on a phone.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
