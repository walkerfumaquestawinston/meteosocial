# MeteoSocial continuity

Read `PROJECT_STATUS.md` and `RIPRENDI-QUI.md` at the start of work, including when this checkout comes from another computer or a portable archive. They identify the authoritative Sites project, current functional baseline, setup and synchronization procedure. Never assume a portable archive is newer than the source saved online.

Before editing on another computer, use the Sites connector with the same account/workspace to inspect the existing project and recover its latest source. If the checkout is missing, clone the source repository returned by the connector into an empty directory. If it exists, fetch first, inspect local changes and reconcile without force pushes or discarding work. Use temporary source credentials only in per-command authentication; never store them in files or Git remotes.

For local setup use `node tools/resume.mjs --check`, then `node tools/resume.mjs --prepare`. `node tools/resume.mjs` also starts the local preview. This requires Node with `node:sqlite` support; prefer the configured Codex workspace runtime before asking the user to install dependencies. Local preview has a clearly identified test profile and a separate empty database, never the production account or data. Production OpenAI secrets remain in Sites.

At the end of authorized development, update durable status/release notes and save the exact source online using the current Sites workflow. Update the existing Site when website changes were requested. Report anything left only on the local computer. Do not configure background synchronizers, unattended publishing, remote control or additional services merely from this continuity rule.

Before changing product behavior or design, read `PROJECT_VISION.md`. It records the user's current product direction. New user instructions take precedence.

Use the latest release notes to distinguish implemented functionality from requested future integrations. Never present the vision or capability contracts as completed services.

The current direction uses media-brand profiles and editorial signatures instead of personal 3D avatars. Preserve stored user data when removing obsolete interfaces. Reuse the existing Site project and public address.

The owner reiterated on 13 September 2026 that the current device is not the primary PC. Preserve cross-device continuity on every update by saving source and release/status documents to this same online project. Do not claim automatic synchronization of folders, browser drafts or local preferences, or remote access to the primary PC: no such connection has been configured.


The owner explicitly requested on 22 September 2026 that every completed update be reflected in the local live preview, GitHub source, and the existing Sites publication. Verify each destination and report any incomplete step. This is a release workflow preference, not permission to install an unattended synchronizer or expose local/private data. Follow the readability-first direction: clear entry points and paired foreground/background colors for every solar phase.
