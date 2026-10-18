# usage-band

A Claude Code mod that shows the conversation's **context** use plus your **5-hour session** and **7-day weekly** rate-limit usage in a band above the prompt, each with a small progress ring, and an animated pixel Claude mascot.

- It remembers the last known values across sessions.
- The rings and the animation show only in the Claude Code **desktop app's Code tab** (not Chat/Cowork). In the terminal you get text only.

## Install

In a terminal Claude Code session (answer `y` to add the marketplace, then pick the user scope):

```
/plugin install usage-band --marketplace ptomeccc/claude-usage-band
```

From a shell:

```
claude plugin install usage-band --marketplace ptomeccc/claude-usage-band
```

In the desktop app: click **+** next to the prompt box → **Plugins** → **Add marketplace** `ptomeccc/claude-usage-band` → **Add plugin**.
