import graphqlDataProvider,{ 
    GraphQLClient ,
    liveProvider as graphqlLiveProvider
} from "@refinedev/nestjs-query";
import { fetchWrapper } from "./fetch-wrapper";
import { createClient } from "graphql-ws";

export const API_URL = "https://api.crm.refine.dev";
export const WS_URL = "wss://api.crm.refine.dev/graphql";
export const BASE_URL = "https://api.crm.refine.dev";

export const client = new GraphQLClient(API_URL,{
    fetch:(url: string, options: RequestInit) =>{
        try{
            fetchWrapper(url, options)

        }catch(err){
            return Promise.reject(err as Error);
        }
    }
})

//Web socket connection

export const wsClient = typeof window !== "undefined" 
    ? createClient({
        url: WS_URL,
        connectionParams:() =>{
            const accessToken = localStorage.getItem('access_token');

            return {
                headers:{
                    Authorization: `Bearer ${accessToken}`
                }
            }

        }
    }) 
    : 
    undefined

//Data provider to make requests to the GraphQL API
export const dataProvider = graphqlDataProvider(client);

//live provider to make subscriptions to the GraphQL API
export const liveProvider = wsClient ? graphqlLiveProvider(wsClient) : undefined;