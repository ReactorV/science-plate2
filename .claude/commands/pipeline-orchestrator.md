# Pipeline Orchestrator

Run the full feature pipeline in sequence:

1. Use the Task tool to invoke the Architect agent with the user's feature description
2. Wait for arch-output.md to exist and be non-empty
3. Use the Task tool to invoke the Coder agent
4. Wait for code-output.md to exist and be non-empty
5. Use the Task tool to invoke the Tester agent
6. If test-failures.md is non-empty: invoke Coder, then re-invoke Tester (max 3x)
7. Use the Task tool to invoke the Reviewer agent
8. Report the verdict from review.md to the user
