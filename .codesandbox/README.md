## Interactive Adapt hello world example

[![Try in Codesandbox.io](https://img.shields.io/badge/Try%20in%20Codesandbox.io-blue)](https://codesandbox.io/p/github/adapt-toolkit/adapt-hello-world-example/release-0.1?file=/.codesandbox/README.md:1,1)

Welcome to the interactive sandbox featuring the [ADAPT Framework](https://www.adaptframework.solutions/) interactive demo. You can find more information in [our documentation](https://docs.adaptframework.solutions/).

To experiment with code, you should clone this repository to your [codesandbox](https://codesandbox.io) account by clicking "Create Branch" or "Fork" in the top right corner. This is necessary to access the preview window, open the terminal, and make changes to the code. 

Note: If you do not clone the repository, you will not be able to perform any of the aforementioned actions.

[Codesandbox](https://codesandbox.io) provides [Cloud Sandboxes](https://codesandbox.io/docs/learn/environment/vm) with the following specifications:
- 2 vCPUs
- 2 GB of RAM
- 6 GB of storage

Your project will start inside the rootless [docker container](./Dockerfile), where you can modify any configuration and execute shell scripts. For your convenience, we have prepared some [tasks](./tasks.json) for you:

- Rebuild app on changes: this task will automatically rebuild and restart nodejs web server on each code change.
- Rebuild mufl code on changes: this task will automatically rebuild mufl code and trigger 'Rebuild app on changes' task.
