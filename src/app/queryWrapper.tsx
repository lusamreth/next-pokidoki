"use client";
import { QueryClient, QueryClientProvider } from "react-query";

const queryclient = new QueryClient();

export default function ClientWrapper({ children }) {
    return (
        <QueryClientProvider client={queryclient}>{children}</QueryClientProvider>
    );
}
