// GERADO por scripts/openapi.mjs a partir de openapi.json. Nao edite a mao:
// rode `pnpm openapi:sync`.

export interface paths {
    "/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Discover what this service does and where its documentation lives
         * @description MarkdownScribe: MarkdownScribe does the Markdown work in one API call: parse frontmatter, build a TOC, lint, format, render Mermaid to SVG, convert any URL to Markdown. Pay per credit. This endpoint needs no API key — it is the entry point when all you have is the host.
         */
        get: operations["getServiceInfo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Check that the service is up
         * @description Liveness probe. No API key required, not charged.
         */
        get: operations["health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/md/frontmatter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Parse YAML frontmatter and split it from the document body
         * @description Returns the frontmatter as a JSON object (null when the document has none) and the remaining Markdown body. Invalid YAML returns 422 with the line and column of the first parser failure.
         */
        post: operations["parseFrontmatter"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/md/toc": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Build a table of contents from the document headings
         * @description Returns the rendered Markdown list plus the structured headings with GitHub-compatible slugs. Use `options.min_depth` and `options.max_depth` to limit heading levels.
         */
        post: operations["buildToc"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/md/lint": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Lint Markdown against structural rules
         * @description Returns every finding with rule, line and description, plus a summary. `valid` is true when nothing was found.
         */
        post: operations["lintMarkdown"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/md/format": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Normalize Markdown formatting
         * @description Returns the formatted document and whether anything changed, so you can use it as a check in CI. `options.prose_wrap` controls paragraph wrapping.
         */
        post: operations["formatMarkdown"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/md/mermaid": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Render Mermaid diagrams to SVG
         * @description Accepts either a bare diagram (`diagram`) or a Markdown document with fenced ```mermaid blocks (`markdown`) — exactly one of the two. Diagrams that fail to render come back in `errors` while the rest still render.
         */
        post: operations["renderMermaid"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/url-to-md": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Convert a web page into Markdown
         * @description `clean` mode tries the cheapest route first (an official .md file, then a static fetch, then a headless browser); `raw` always renders. `metadata.used_playwright` tells you which path was taken, and the cost follows it.
         */
        post: operations["convertUrlToMarkdown"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * @description Stable snake_case error code. Each one has a page at https://docs.markdownscribe.com/errors/<code>.
         * @enum {string}
         */
        ErrorCode: "validation" | "invalid_request" | "unauthorized" | "insufficient_credits" | "not_found" | "key_limit_reached" | "payload_too_large" | "invalid_frontmatter" | "extraction_empty" | "fetch_failed" | "rate_limited" | "internal" | "service_unavailable" | "clerk_not_configured" | "timeout";
    };
    responses: {
        /** @description Error response. Every failure uses this shape: `error` is the stable code, `hint` says what to do next. */
        Error: {
            headers: {
                "X-Request-Id": components["headers"]["X-Request-Id"];
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    error: components["schemas"]["ErrorCode"];
                    /** @description One sentence saying what to do next — not what went wrong. */
                    hint: string;
                    /** @description Documentation page for this specific code. */
                    docs_url: string;
                    request_id: string;
                    /** @description A runnable command that resolves the error, when one exists. */
                    next_step?: string;
                    /** @description Pre-filled issue, carrying only the request_id. 5xx only. */
                    report_url?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        /** @description Rate limit exceeded. Wait Retry-After seconds before retrying; retrying immediately makes the queue worse. */
        RateLimited: {
            headers: {
                "X-Request-Id": components["headers"]["X-Request-Id"];
                "Retry-After": components["headers"]["Retry-After"];
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    error: components["schemas"]["ErrorCode"];
                    /** @description One sentence saying what to do next — not what went wrong. */
                    hint: string;
                    /** @description Documentation page for this specific code. */
                    docs_url: string;
                    request_id: string;
                    /** @description A runnable command that resolves the error, when one exists. */
                    next_step?: string;
                    /** @description Pre-filled issue, carrying only the request_id. 5xx only. */
                    report_url?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
    };
    parameters: never;
    requestBodies: never;
    headers: {
        /** @description Identifier for this request, on every response. Quote it in any bug report. */
        "X-Request-Id": string;
        /** @description Credits charged for this call. Absent when nothing was charged. */
        "X-Credits-Charged": number;
        /** @description Account balance after this call, read inside the same transaction as the debit. Absent when nothing was charged. */
        "X-Credits-Remaining": number;
        /** @description Seconds to wait before retrying. Sent with 429. */
        "Retry-After": number;
    };
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getServiceInfo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["X-Request-Id"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        name: string;
                        description: string;
                        version: string;
                        docs: string;
                        openapi: string;
                        llms_txt: string;
                        pricing: string;
                        mcp: string | null;
                        status: string | null;
                    };
                };
            };
        };
    };
    health: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["X-Request-Id"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @constant */
                        status: "ok";
                        uptime_ms: number;
                        core_version: string;
                        node_version: string;
                    };
                };
            };
        };
    };
    parseFrontmatter: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    markdown: string;
                };
            };
        };
        responses: {
            /** @description Success. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["X-Request-Id"];
                    "X-Credits-Charged": components["headers"]["X-Credits-Charged"];
                    "X-Credits-Remaining": components["headers"]["X-Credits-Remaining"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        frontmatter: {
                            [key: string]: unknown;
                        } | null;
                        body: string;
                        meta: {
                            /** @description Same value as the X-Request-Id response header. Quote it in any bug report. */
                            request_id: string;
                            /** @description Server-side processing time for this operation. */
                            duration_ms: number;
                            /** @description Credits charged for this call. Also in the X-Credits-Charged header. */
                            credits: number;
                        };
                    };
                };
            };
            /** @description Invalid request body. */
            400: components["responses"]["Error"];
            /** @description Missing or invalid API key. */
            401: components["responses"]["Error"];
            /** @description Not enough credits. */
            402: components["responses"]["Error"];
            /** @description Request body above the size limit. */
            413: components["responses"]["Error"];
            429: components["responses"]["RateLimited"];
            /** @description Unexpected server error. */
            500: components["responses"]["Error"];
        };
    };
    buildToc: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    markdown: string;
                    /** @default {} */
                    options?: {
                        /** @default 1 */
                        min_depth?: number;
                        /** @default 6 */
                        max_depth?: number;
                    };
                };
            };
        };
        responses: {
            /** @description Success. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["X-Request-Id"];
                    "X-Credits-Charged": components["headers"]["X-Credits-Charged"];
                    "X-Credits-Remaining": components["headers"]["X-Credits-Remaining"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        toc: string;
                        headings: {
                            depth: number;
                            text: string;
                            slug: string;
                            line: number;
                        }[];
                        meta: {
                            /** @description Same value as the X-Request-Id response header. Quote it in any bug report. */
                            request_id: string;
                            /** @description Server-side processing time for this operation. */
                            duration_ms: number;
                            /** @description Credits charged for this call. Also in the X-Credits-Charged header. */
                            credits: number;
                        };
                    };
                };
            };
            /** @description Invalid request body. */
            400: components["responses"]["Error"];
            /** @description Missing or invalid API key. */
            401: components["responses"]["Error"];
            /** @description Not enough credits. */
            402: components["responses"]["Error"];
            /** @description Request body above the size limit. */
            413: components["responses"]["Error"];
            429: components["responses"]["RateLimited"];
            /** @description Unexpected server error. */
            500: components["responses"]["Error"];
        };
    };
    lintMarkdown: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    markdown: string;
                };
            };
        };
        responses: {
            /** @description Success. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["X-Request-Id"];
                    "X-Credits-Charged": components["headers"]["X-Credits-Charged"];
                    "X-Credits-Remaining": components["headers"]["X-Credits-Remaining"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        valid: boolean;
                        findings: {
                            rule: string;
                            name: string;
                            line: number;
                            column?: number;
                            message: string;
                            detail?: string;
                            hint?: string;
                            doc_url: string;
                        }[];
                        summary: {
                            total: number;
                        };
                        meta: {
                            /** @description Same value as the X-Request-Id response header. Quote it in any bug report. */
                            request_id: string;
                            /** @description Server-side processing time for this operation. */
                            duration_ms: number;
                            /** @description Credits charged for this call. Also in the X-Credits-Charged header. */
                            credits: number;
                        };
                    };
                };
            };
            /** @description Invalid request body. */
            400: components["responses"]["Error"];
            /** @description Missing or invalid API key. */
            401: components["responses"]["Error"];
            /** @description Not enough credits. */
            402: components["responses"]["Error"];
            /** @description Request body above the size limit. */
            413: components["responses"]["Error"];
            429: components["responses"]["RateLimited"];
            /** @description Unexpected server error. */
            500: components["responses"]["Error"];
        };
    };
    formatMarkdown: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    markdown: string;
                    /** @default {} */
                    options?: {
                        /**
                         * @default preserve
                         * @enum {string}
                         */
                        prose_wrap?: "preserve" | "always" | "never";
                    };
                };
            };
        };
        responses: {
            /** @description Success. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["X-Request-Id"];
                    "X-Credits-Charged": components["headers"]["X-Credits-Charged"];
                    "X-Credits-Remaining": components["headers"]["X-Credits-Remaining"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        formatted: string;
                        changed: boolean;
                        meta: {
                            /** @description Same value as the X-Request-Id response header. Quote it in any bug report. */
                            request_id: string;
                            /** @description Server-side processing time for this operation. */
                            duration_ms: number;
                            /** @description Credits charged for this call. Also in the X-Credits-Charged header. */
                            credits: number;
                        };
                    };
                };
            };
            /** @description Invalid request body. */
            400: components["responses"]["Error"];
            /** @description Missing or invalid API key. */
            401: components["responses"]["Error"];
            /** @description Not enough credits. */
            402: components["responses"]["Error"];
            /** @description Request body above the size limit. */
            413: components["responses"]["Error"];
            429: components["responses"]["RateLimited"];
            /** @description Unexpected server error. */
            500: components["responses"]["Error"];
        };
    };
    renderMermaid: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    diagram?: string;
                    markdown?: string;
                };
            };
        };
        responses: {
            /** @description Success. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["X-Request-Id"];
                    "X-Credits-Charged": components["headers"]["X-Credits-Charged"];
                    "X-Credits-Remaining": components["headers"]["X-Credits-Remaining"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        diagrams: {
                            index: number;
                            line?: number;
                            svg: string;
                        }[];
                        errors: {
                            index: number;
                            line?: number;
                            message: string;
                        }[];
                        summary: {
                            total: number;
                            rendered: number;
                            failed: number;
                        };
                        meta: {
                            /** @description Same value as the X-Request-Id response header. Quote it in any bug report. */
                            request_id: string;
                            /** @description Server-side processing time for this operation. */
                            duration_ms: number;
                            /** @description Credits charged for this call. Also in the X-Credits-Charged header. */
                            credits: number;
                        };
                    };
                };
            };
            /** @description Invalid request body. */
            400: components["responses"]["Error"];
            /** @description Missing or invalid API key. */
            401: components["responses"]["Error"];
            /** @description Not enough credits. */
            402: components["responses"]["Error"];
            /** @description Request body above the size limit. */
            413: components["responses"]["Error"];
            429: components["responses"]["RateLimited"];
            /** @description Unexpected server error. */
            500: components["responses"]["Error"];
        };
    };
    convertUrlToMarkdown: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** Format: uri */
                    url: string;
                    /**
                     * @default clean
                     * @enum {string}
                     */
                    mode?: "clean" | "raw";
                };
            };
        };
        responses: {
            /** @description Success. */
            200: {
                headers: {
                    "X-Request-Id": components["headers"]["X-Request-Id"];
                    "X-Credits-Charged": components["headers"]["X-Credits-Charged"];
                    "X-Credits-Remaining": components["headers"]["X-Credits-Remaining"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        markdown: string;
                        /** @enum {string} */
                        mode: "clean" | "raw";
                        metadata: {
                            title: string | null;
                            author: string | null;
                            published_date: string | null;
                            used_playwright: boolean;
                            extraction_quality: string | null;
                        };
                        meta: {
                            /** @description Same value as the X-Request-Id response header. Quote it in any bug report. */
                            request_id: string;
                            /** @description Server-side processing time for this operation. */
                            duration_ms: number;
                            /** @description Credits charged for this call. Also in the X-Credits-Charged header. */
                            credits: number;
                        };
                    };
                };
            };
            /** @description Invalid request body. */
            400: components["responses"]["Error"];
            /** @description Missing or invalid API key. */
            401: components["responses"]["Error"];
            /** @description Not enough credits. */
            402: components["responses"]["Error"];
            /** @description Request body above the size limit. */
            413: components["responses"]["Error"];
            429: components["responses"]["RateLimited"];
            /** @description Unexpected server error. */
            500: components["responses"]["Error"];
        };
    };
}
