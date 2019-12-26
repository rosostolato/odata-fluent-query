export class User {
  id: number;
  mail: string;
  surname: string;
  givenName: string;
  createDate: Date;
  accountEnabled: boolean;

  // one2one
  address: Address;

  // one2many
  posts: Post[];
}

export class Address {
  code: number;
  street: string;
  user: User;
}

export class Post {
  id: number;
  content: string;
  date: Date
}
