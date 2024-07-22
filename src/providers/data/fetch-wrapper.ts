import { GraphQLError, GraphQLFormattedError } from "graphql";


type Error = {
    message:string;
    statusCode: string;
}

///Our Middleware
const customFetch = async (url: string, options: RequestInit) =>{

    const accessToken = localStorage.getItem('access_token');

    const headers = options.headers as Record<string,string>;

    return await fetch(url,{
        ...options,
        headers: {
           ...headers,
            Authorization: headers?.Authorization ||  `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            "Apollo-Require-Preflight": "true"
        },
    })
}
//Our Custom Error Handling function
const getGraphQLErrors = (body: Record<"errors",GraphQLFormattedError[] | undefined>) : Error | null => {
    if(!body){
        return {
            message: "Unknown error",
            statusCode: "INTERNAL_SERVER ERROR",
        }
    }

    if("error" in body){
        const errors = body?.errors;

        const messages = errors?.map((error) => error?.message)?.join("");
        const code = errors?.[0].extensions?.code;

        return {
            message: messages || JSON.stringify(errors),
            statusCode: code || 500
        }
    }

    //If there is no error then return null 
    return null;
}


//Our Custom Fetch Wrapper Function
export const fetchWrapper = async (url: string, options: RequestInit) => {

    const response = await customFetch(url, options);

    //create clone of the response JSON
    const responseClone = response.clone();
    const body = await responseClone.json();

    const error = getGraphQLErrors(body);

    if(error) {
        throw new Error(error.message);
    }

    return response;

}