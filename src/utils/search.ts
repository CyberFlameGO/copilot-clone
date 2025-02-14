import SnippetExtractors from "./extractors";
import { SnippetResult } from "./extractors/ExtractorAbstract";

import { FetchPageResult, fetchPageTextContent } from "./fetchPageContent";

/**
 * Cache results to avoid VSCode keep refetching
 */
let cachedResults: { [keyword: string]: SnippetResult[] } = {}

// Send search query to google, get answers from stackoverflow
// then extract and return code results
export async function search(keyword: string): Promise<null | { results: SnippetResult[] }> {

    if (keyword in cachedResults) {
        return Promise.resolve({ results: cachedResults[keyword] })
    }

    /* eslint "no-async-promise-executor": "off" */
    return new Promise(async (resolve, reject) => {

        let results: SnippetResult[] = [];
        let fetchResult: FetchPageResult;

        try {
            for (const i in SnippetExtractors) {
                const extractor = SnippetExtractors[i];
                const urls = await extractor.extractURLFromKeyword(keyword);

                for (const y in urls) {
                    fetchResult = await fetchPageTextContent(urls[y]);
                    results = results.concat(extractor.extractSnippets(fetchResult));
                }
            }

            cachedResults[keyword] = results;

            resolve({ results });
        } catch (err) {
            reject(err);
        }
    });
}
