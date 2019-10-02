import { mk_query } from "../lib/query";

interface User {
    id: number;
    displayName: string;
}

const query = mk_query<User>();