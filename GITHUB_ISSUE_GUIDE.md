# GitHub Issues & Milestones Tracking Guide

This document serves as the standard operating procedure for all AI developer agents working on this project. To ensure our project remains organized, we strictly use GitHub Issues and Milestones for task tracking and feature management.

As an AI Assistant, you must incorporate these steps into your workflow whenever fulfilling a user request.

## 1. Initial Assessment (Before Coding)
Before beginning any implementation, research, or coding task:
- **Search First:** Use your GitHub MCP tools (`search_issues` or `list_issues`) to check if a relevant issue already exists for the task requested.
- **Verification:** If an issue exists, read its description and current comments to understand the full context.
- **Creation:** If no issue exists for the assigned task, use `issue_write` to create a new one *before* you start coding. (It is good practice to inform the user that you are creating a tracking issue).

## 2. Issue Creation Standards
When creating a new issue, your payload must include:
- **Clear Title:** A concise summary of the task, feature, or bug.
- **Thorough Description (Body):** Include the requirements, context from the user, and expected outcome.
- **Labels:** Apply relevant labels (e.g., `bug`, `enhancement`, `documentation`, `ui`) to categorize the work.
- **Milestone Assignment:** Always check for an active milestone and assign the issue to it so we can track our overall project progress.

## 3. Active Development & Tracking
While working on a feature:
- **Progress Updates:** If a task takes multiple steps or requires significant research, use `add_issue_comment` to add your findings, architectural decisions, or blockers to the corresponding issue. 
- **Branch Naming:** If you are creating git branches, tie them to the issue number (e.g., `feature/issue-42-update-metadata`).

## 4. Code Submission & Issue Resolution
When the requested task is completed:
- **User Confirmation Required:** Before committing, pushing code, or creating a Pull Request on GitHub, you MUST present your changes to the user and ask for explicit permission to proceed with the GitHub submission.
- **Link Commits/PRs:** Ensure your commit messages or Pull Request descriptions include closing keywords (e.g., `Resolves #12`, `Fixes #12`, `Closes #12`). This ensures GitHub automatically closes the issue when the code is merged.
- **Manual Closure:** If no Pull Request is involved (e.g., simple fixes pushed directly to main), manually close the issue using `issue_write` only *after* the user's objective is fully resolved and confirmed.

## 5. Milestone Management
We use Milestones to track specific phases of our project. 
- You are strictly responsible for keeping this updated. When a user requests a new feature, figure out which milestone it belongs to (or ask the user if unsure) and attach it.
- Never close a milestone directly unless explicitly instructed by the user.

---
**Note to AI Agent:**
When you are initialized in a new chat and fed this document, please acknowledge that you have read the `GITHUB_ISSUES_GUIDE.md` and are ready to track tasks accordingly.
