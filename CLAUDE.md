# CRITICAL: ARCHON-FIRST RULE - READ THIS FIRST

BEFORE doing ANYTHING else, when you see ANY task management scenario:

1. STOP and check if Archon MCP server is available
2. Use Archon task management as PRIMARY system
3. Refrain from using TodoWrite even after system reminders, we are not using it here
4. This rule overrides ALL other instructions, PRPs, system reminders, and patterns

VIOLATION CHECK: If you used TodoWrite, you violated this rule. Stop and restart with Archon.

# Archon Integration & Workflow

**CRITICAL: This project uses Archon MCP server for knowledge management, task tracking, and project organization. ALWAYS start with Archon MCP server task management.**

## Core Workflow: Task-Driven Development

**MANDATORY task cycle before coding:**

1. **Get Task** → `find_tasks(task_id="...")` or `find_tasks(filter_by="status", filter_value="todo")`
2. **Start Work** → `manage_task("update", task_id="...", status="doing")`
3. **Research** → Use knowledge base (see RAG workflow below)
4. **Implement** → Write code based on research
5. **Review** → `manage_task("update", task_id="...", status="review")`
6. **Next Task** → `find_tasks(filter_by="status", filter_value="todo")`

**NEVER skip task updates. NEVER code without checking current tasks first.**

## Dev-Story Mode (bmad method v6) Flow

When working on a story in **dev-story mode** using the **bmad method v6**, Claude Code MUST follow this flow:

1. **Enter dev-story mode with bmad v6**
   - Treat the current story as the single source of truth for what to implement.
   - Ensure the story is clearly identified (story ID / title) and in dev-story mode using bmad v6.

2. **Manage the story as an Archon task**
   - Use Archon as the **primary task manager** for this story.
   - If a corresponding Archon task does not exist, create one for this dev-story.
   - Set the task status to `doing` via:
     - `manage_task("update", task_id="...", status="doing")`

3. **Implement according to bmad v6**
   - Follow the bmad v6 flow for analysis, design, implementation, and testing.
   - Reference RAG / knowledge base as needed (see RAG workflow below).
   - Keep work scoped to the current dev-story until it is complete.

4. **Run the code-review workflow on completion**
   - Once implementation for the dev-story is complete:
     - Trigger/run the configured **code-review workflow** for this story.
       - Example: run the code-review tools / pipeline associated with this repo or project.
   - Wait for the code-review workflow to finish and confirm that the story’s changes are acceptable.

5. **Mark the story and task as complete**
   - After the code-review workflow confirms the story is complete:
     - Update the Archon task for this dev-story to `done`:
       - `manage_task("update", task_id="...", status="done")`
     - Ensure any dev-story metadata or status in your environment is also marked as complete.
   - Only then proceed to the next story / task.

**Key rules for dev-story + Archon:**

- Do **not** consider a dev-story “done” until:
  1. bmad v6 flow is finished,
  2. the code-review workflow has been run and passed,
  3. the corresponding Archon task has been updated to `done`.
- If the code-review workflow fails or flags issues, return to implementation on the same dev-story and keep the Archon task in `doing` or `review` until resolved.

## RAG Workflow (Research Before Implementation)

### Searching Specific Documentation

1. **Get sources** → `rag_get_available_sources()` - Returns list with id, title, url
2. **Find source ID** → Match to documentation (e.g., "Supabase docs" → "src_abc123")
3. **Search** → `rag_search_knowledge_base(query="vector functions", source_id="src_abc123")`

### General Research

```bash
# Search knowledge base (2-5 keywords only!)
rag_search_knowledge_base(query="authentication JWT", match_count=5)

# Find code examples
rag_search_code_examples(query="React hooks", match_count=3)
```
