export interface User {
    id: number | null;
    mail: string | null;
    surname?: string;
    givenName: string;
    createDate: Date;
    accountEnabled: boolean;
    phoneNumbers: string[];
    address: Address;
    address2?: Address;
    posts: Post[];
}
export interface Address {
    code: number;
    street: string;
    user: User;
}
export interface Post {
    id: number;
    date: Date;
    content: string;
    comments: (string | null)[];
}
