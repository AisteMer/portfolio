# Minishell

## Overview
`minishell` is a command-line shell implemented in C, designed to replicate basic functionalities of a Unix shell. It allows users to execute commands, manage processes, and perform input/output redirection, providing a hands-on experience with systems programming concepts such as process creation, signal handling, and inter-process communication.

## Features
- **Command Execution:** Supports running both built-in and external commands.
- **Input/Output Redirection:** Redirect standard input/output to files or other commands.
- **Pipes:** Supports piping the output of one command as input to another.
- **Signal Handling:** Properly handles signals like `CTRL+C` (SIGINT) to interrupt running processes.
- **Custom Environment Variables:** Supports setting and using custom environment variables.
- **Error Handling:** Provides informative error messages for invalid commands and operations.

## Challenges & Learnings
- **Process management:** implementing features, such as 'fork', 'exec', and 'wait' to manage child processes.
- **Signal handling:** managing signals, such as 'SIGINT' taught me how to control the program flow for a smoother user experience
- **Pipes and redirection:** implementing pipes and I/O redirection helped better udnerstand Unix/Linux file descriptors and inter-process communication.

## Future enhancements
- **Built-in Command expansion** features, such as 'history' and 'alias'
- **Support for advanced scripting**
