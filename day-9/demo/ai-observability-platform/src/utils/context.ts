import { AsyncLocalStorage } from "async_hooks";

type RequestContext = {

    requestId: string;

    correlationId: string;

};

const asyncLocalStorage =

    new AsyncLocalStorage<RequestContext>();

export default asyncLocalStorage;