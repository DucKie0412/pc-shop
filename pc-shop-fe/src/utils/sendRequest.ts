export const sendRequest = async <T>(props: IRequest) => {
    let { url, method, body, queryParams = {}, useCredentials = false, headers = {}, nextOption = {} } = props;

    const options: any = {
        method,
        headers: new Headers({ "Content-Type": "application/json", ...headers }),
        body: body ? JSON.stringify(body) : null,
        ...nextOption
    };

    if (useCredentials) options.credentials = "include"; // Important for authentication

    if (queryParams) {
        url = `${url}?${new URLSearchParams(queryParams).toString()}`;
    }

    const res = await fetch(url, options);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Something went wrong");
    }

    return res.json() as T;
};
