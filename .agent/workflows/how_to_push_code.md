---
description: How to push code to the remote repository
---

# How to Push Code

Here are the steps to push your changes to GitHub:

1.  **Check Status**: See which files have changed.
    ```bash
    git status
    ```

2.  **Add Changes**: Stage your changes for commit.
    - To add all changes:
      ```bash
      git add .
      ```
    - To add specific files:
      ```bash
      git add path/to/file
      ```

3.  **Commit Changes**: Save your staged changes with a message.
    ```bash
    git commit -m "Your descriptive message here"
    ```

4.  **Push to Remote**: Send your commits to the remote repository (GitHub).
    ```bash
    git push origin main
    ```
    *Note: Replace `main` with your branch name if different.*
