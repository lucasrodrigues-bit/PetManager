# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Ao aplicar uma migration direto no Supabase via MCP, sempre commitar o arquivo .sql local e marcar a task no mesmo momento - nunca deixar o banco na frente do repositorio/specs.
- signal: `spec_deviation` · recurrence: 1 feature(s) · harmful: 0
- features: petmanager-mvp
- evidence: supabase/migrations (T5 gap, 2026-09-18)
- last seen: 2026-09-18T01:03:47Z

### L-002 - Ao planejar migrations em fases separadas, checar se uma task anterior ja depende de colunas so previstas pra uma migration futura - sequenciar a migration antes da task que precisa dela, nao junto com outra feature maior.
- signal: `spec_deviation` · recurrence: 1 feature(s) · harmful: 0
- features: petmanager-completo
- evidence: design.md data model (produtos.categoria/estoque_minimo, T18 vs T20)
- last seen: 2026-09-19T19:42:41Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
