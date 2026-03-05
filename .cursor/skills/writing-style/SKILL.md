---
name: writing-style
description: Enforce concise code comments and sentence case for UI copy. Use when writing or reviewing comments, labels, button text, headings, error messages, tooltips, or any user-facing strings.
---

# Writing Style

## Code Comments

- Only comment **why**, not what. If the code already communicates intent, skip the comment.
- Never narrate obvious operations (`// increment counter`, `// return result`).
- Keep comments to one line when possible. Remove filler words.

**Good:**

```python
# Falls back to UTC when the user has no timezone preference
dt = dt.astimezone(tz or UTC)
```

**Bad:**

```python
# Here we are converting the datetime to the user's timezone.
# If the user does not have a timezone preference, we fall back to UTC.
dt = dt.astimezone(tz or UTC)
```

## UI & User-Facing Copy

Use **sentence case** everywhere: headings, buttons, labels, tabs, menu items, tooltips, error messages, and placeholder text.

Sentence case means: capitalize only the first word and proper nouns.

| Good | Bad |
|------|-----|
| Create new project | Create New Project |
| Upload your file | Upload Your File |
| No results found | No Results Found |
| Sign in with Google | Sign In With Google |

### Quick rules

1. First word capitalized, rest lowercase (except proper nouns).
2. Acronyms stay uppercase: "Connect to AWS", "Enable SSO".
3. Product names keep their branding: "Sign in with GitHub".
4. Avoid ALL CAPS for emphasis; use bold or hierarchy instead.
