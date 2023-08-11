export interface Message {
    content: string;
    outgoing: boolean;
  }
  
  export interface Chat {
    id: string;
    name: string;
    messages: Message[];
  }
  