## **ADAPT Messenger Demo Overview**

The ADAPT team is proud to present a decentralized messenger demo featuring end-to-end message encryption. This repository demonstrates how messages can be broadcast securely, with each recipient in a group chat receiving a uniquely encrypted message, all achieved with just a few lines of MUFL code. 

While the messenger application is the centerpiece, the true essence lies in highlighting the robust capabilities of the ADAPT framework and MUFL. This demo stands as proof of the simplicity and efficiency ADAPT offers to developers.

Navigate through the sections for an in-depth look:

1. [Messenger Architecture](#messenger-architecture)
2. [Code Structure](#code-structure)
3. [How to Build](#how-to-build)
4. [ADAPT Architecture](#adapt-architecture)

### **Messenger Architecture**

The ADAPT messenger demo harnesses the serverless architecture of the messenger. This ensures that messages are exchanged directly between users. In group chats, messages are broadcasted, meaning when a user sends a message to the group, it's simultaneously dispatched to every other member of that group. What's more, each message is encrypted using a distinct encryption key.

> **Example:** If a chat consists of 10 members and one of them sends a message, that single message is encrypted using 9 unique keys for the 9 other members. These encrypted messages are then sent out individually to each member.

Joining a chat requires an invite code from an existing member. This code carries a transient encryption key used only once during the initial key exchange. Post this exchange, members can send encrypted messages amongst themselves. The inviter also ensures that every existing member of the chat is introduced to the newcomer, facilitating an exchange of encryption and signing keys.

It's crucial to understand that the extensive encryption, key exchange, and signing mechanisms discussed above are inherent features of MUFL, and not bespoke additions for this demo. This ingrained functionality simplifies the development process substantially.

For a more exhaustive understanding of ADAPT, MUFL, and this demo, consult our [detailed tutorial](link-here), which meticulously walks through the demo's development and deep-dives into MUFL code.

### **Code Structure**

```
|-- compile-mufl-code-in-docker.sh # this script allows you 
|                                    to compile your local
|                                    MUFL code using ADAPT 
|                                    docker development kit
|
|-- docker-compose.yml             # docker compose configuration of the demo.
|                                    it contains just 2 containers -- broker and web
|
|-- Dockerfile                     # Dockerfile containing instructions how 
|                                    how to create a docker image          
|
|-- LICENSE                        # ADAPT license
|
|-- README.md                      # You are reading this file now!
|
|-- mufl_code                      # Directory containing all the MUFL code
|   |
|   |-- actor.mu                   # Main MUFL application implementing 
|   |                               the business logic of the messenger 
|   |
|   |-- config.mufl                # MUFL config file specifiying a path
|   |                                to the MUFL standard library
|   |
|   \-- <...>.muflo                # Compiled MUFL code
|
\-- web                            # Directory containing frontend code.
                                     For details, please refer to the source code
```


### **How to build**

To get the ADAPT messenger demo up and running, first, construct a Docker image. Then, use the docker-compose utility to initiate the containers.

```bash
docker build . -t adapt-messenger:latest # build docker image

docker-compose up -d # run docker containers

open http://localhost:8080 # open a browser tab
```

To shut down the demo, execute:

```
docker-compose down
```

If there's any modification to the MUFL code, recompilation is necessary. This can be achieved effortlessly using the compile-mufl-code-in-docker.sh script.

```bash 
./compile-mufl-code-in-docker.sh
```

Once recompiled, the frontend application will utilize this updated version automatically.

### **ADAPT Architecture**

In the context of this messenger demo, the architecture of ADAPT consists of two main components: the browser user's node and the message broker.

1. **Browser User's Node**: This node operates the user's ADAPT packet, which embodies the chat's entire business logic. The browser node supervises the user's packet, initiates transactions within that packet, and archives the packet's new state post-transaction. All these operations leverage the ADAPT JS API—a suite of TypeScript functions crafted for evaluating MUFL code within TypeScript/JavaScript. In browser environments, the ADAPT JS API is realized as a WebAssembly (WASM) module, whereas in native platforms, it functions as a NodeJS addon.

   > For a comprehensive understanding of the ADAPT JS API, visit our [documentation](link-to-adapt-js-api-page).

2. **Message Broker**: Within the MUFL code, inter-node communication is guided by packet IDs. The message broker's role is to associate these packet IDs with the actual IP addresses of the nodes. Notably, in this demo, every message that traverses the message broker is encrypted—though this is contingent on the MUFL-based application logic. Consequently, even in scenarios where the message broker's integrity is compromised, the attacker cannot glean any sensitive information.

Outlined below is the three-step communication process between any two nodes:

1. Packet A submits a registration request to the broker. In response, the broker correlates the requesting packet's ID with its actual IP address.
2. Packet B replicates the aforementioned registration process.
3. Packet A dispatches a message intended for Packet B via the message broker. The broker discerns Packet B's IP address and routes the message accordingly.

A standout feature of ADAPT is its abstraction of the underlying communication mechanisms, allowing MUFL developers to focus exclusively on crafting the application's business logic and facilitating node communication. This segregation not only optimizes the development process but also simplifies it.
