# Unity Engine — Version Reference

| Field | Value |
|-------|-------|
| **Engine Version** | Unity 2022.3.62f2 (LTS) |
| **Installed at pin time** | 2022.3.62f2 — matches the pin (found in the Unity Hub editor directory; Android Build Support module present) |
| **Project Pinned** | 2026-10-01 |
| **LLM Knowledge Cutoff** | May 2025 |
| **Risk Level** | LOW — version is within LLM training data (Unity 2022 LTS, ~2022.3) |

## Note

This engine version is within the LLM's training data. Engine reference
docs are optional but can be added later if agents suggest incorrect APIs.

Run `/setup-engine refresh` to populate full reference docs at any time.

## Other files in this directory describe Unity 6.3 LTS, not the pinned version

`breaking-changes.md`, `deprecated-apis.md`, `current-best-practices.md`,
`modules/` and `plugins/` were written for **Unity 6.3 LTS** (this directory's
previous pin, set 2026-02-13) and were **not verified against 2022.3**. Treat
them as the migration path for a future `/setup-engine upgrade 2022.3 6.3`, not
as a description of the engine installed here. In particular, anything that says
the new Input System, UI Toolkit runtime UI, or Entities 1.x is "default" or
"production-ready" is a Unity 6 claim — check it against the 2022.3 docs before
relying on it.

## Verified Sources

- 2022.3 command-line arguments (checked 2026-10-01): https://docs.unity3d.com/2022.3/Documentation/Manual/EditorCommandLineArguments.html — no `-buildAndroidPlayer` flag exists; Android builds use `-buildTarget android` with `-executeMethod`.
