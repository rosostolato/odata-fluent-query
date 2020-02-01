export interface User {
  id: number;
  mail: string;
  surname: string;
  givenName: string;
  createDate: Date;
  accountEnabled: boolean;

  // simple array
  phoneNumbers: string[];

  // one2one
  address: Address;

  // one2many
  posts: Post[];
}

export interface Address {
  code: number;
  street: string;
  user: User;
}

export interface Post {
  id: number;
  content: string;
  date: Date
}
