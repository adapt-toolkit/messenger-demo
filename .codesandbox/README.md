## Interactive ADAPT Messenger Demo

Welcome to the [ADAPT](https://www.adaptframework.solutions/) interactive messenger demo. This is the sandbox version of [ADAPT demo](https://messenger-demo.adaptframework.solutions/) which shows a bare-bones front-end-only browser-based messaging application. 

For the detailed description of the demo and context, please see the [project's README](../README.md), which introduces the ADAPT framework and describes the basic architecture of this demo project. For the detailed explanation of MUFL code that implements the messenger logic see tutorial [Part 1](https://docs.adaptframework.solutions/messenger-tutorial-1.html) and [Part2](https://docs.adaptframework.solutions/messenger-tutorial-2.html)

The sandbox allows you to experiment with code on your own. To do this, you should clone this repository to your [codesandbox](https://codesandbox.io) account by clicking "Create Branch" or "Fork" in the top right corner. This is necessary to access the preview window, open the terminal, and make changes to the code. If you experience any problems, please ping us on [our Discord](https://discord.gg/VjKSBS2u7H). 

[Codesandbox](https://codesandbox.io) provides [Cloud Sandboxes](https://codesandbox.io/docs/learn/environment/vm) with the following specifications:
- 2 vCPUs
- 2 GB of RAM
- 6 GB of storage

Your project will start inside the rootless [docker container](./Dockerfile), where you can modify any configuration and execute shell scripts. For your convenience, we have prepared some [tasks](./tasks.json) for you:

- Rebuild app on changes: this task will automatically rebuild and restart nodejs web server on each code change.
- Rebuild mufl code on changes: this task will automatically rebuild mufl code and trigger 'Rebuild app on changes' task.
