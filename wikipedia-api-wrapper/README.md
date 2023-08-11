# Wikipedia Top Articles API Wrapper

This solution wraps around the Wikipedia API to provide aggregated and specific views data for articles based on user's query. The API is built on top of Express.js and utilizes Axios for HTTP requests.

## Endpoints:

1. `/top-articles/:year/:month/:day`
    - Fetches top articles based on views for a specific date.
    - Query parameters: `duration` which can either be 'week' or 'month'.

2. `/article-views/:year/:month/:day`
    - Fetches views for a specific article based on the date.
    - Query parameters: `title` (required) which is the name of the article, and `duration`.

3. `/max-views-day/:year/:month`
    - Determines which day in a specified month and year a given article had the most views.
    - Query parameters: `title` (required).

## Installation & Usage:

1. Clone the repository.
2. Install the necessary dependencies using `npm install`.
3. Run the server using `npm start` or `npm run dev` for development.
4. Access the API endpoints via a browser or API testing tool like Postman.

## Test Cases:

1. Fetch top articles for a given day:
    - Endpoint: `/top-articles/2015/10/10?duration=week`
    - Expected Result: List of top articles for the week starting from 10th October 2015.

2. Fetch views for a specific article:
    - Endpoint: `/article-views/2022/06/10?title=Python&duration=month`
    - Expected Result: Monthly views for the article "Python" starting from 10th June 2022.

3. Determine the day with max views for a given article in a month:
    - Endpoint: `/max-views-day/2022/06?title=Python`
    - Expected Result: The day in June 2022 where the article "Python" had the most views.

    ## Extended Test Cases:

### Corner Cases & Invalid Inputs:

1. **Missing or Invalid Date Parameter**:
    - Endpoint: `/top-articles/2015/13/10?duration=week`
    - Expected Result: A response with a 400 status code indicating an invalid date.
    
2. **Invalid Duration**:
    - Endpoint: `/top-articles/2015/06/10?duration=year`
    - Expected Result: A response with a 400 status code indicating invalid duration value.
    
3. **Missing Article Title**:
    - Endpoint: `/article-views/2015/06/10?duration=week`
    - Expected Result: A response with a 400 status code indicating missing title.

4. **Article Title with Special Characters**:
    - Endpoint: `/article-views/2015/10/10?title=Python%20%26%20Java&duration=week`
    - Expected Result: Views for the article "Python & Java" or a 404 if the article doesn't exist.

5. **Date in the Future**:
    - Endpoint: `/max-views-day/2030/06?title=Python`
    - Expected Result: A response with a 400 or 404 status code, indicating the data for this future date isn't available.

6. **Querying an Article that Doesn't Exist**:
    - Endpoint: `/max-views-day/2022/06?title=NonExistentArticle12345`
    - Expected Result: A response with a 404 status code indicating no data found for the given article title.

7. **Month without a Day Parameter**:
    - Endpoint: `/top-articles/2022/06?duration=week`
    - Expected Result: A response with a 400 status code indicating the day parameter is missing.

8. **Leap Year Consideration**:
    - Endpoint: `/top-articles/2020/02/29?duration=week`
    - Expected Result: Proper response as 29th February 2020 is valid, being a leap year. 

9. **No Query Parameters Provided**:
    - Endpoint: `/max-views-day/2022/06`
    - Expected Result: A response with a 400 status code indicating missing title query parameter.

10. **Handle Wikipedia API Downtime or Errors**:
    - If the Wikipedia API returns an error or doesn't respond.
    - Expected Result: A response with a 500 status code indicating an external API error, ideally with some message about the issue for clarity.

## Future Improvements:

1. **Caching**: Implement caching mechanisms to reduce the number of repeated API calls to Wikipedia. This can significantly improve response times for frequently queried data.

2. **Pagination**: Instead of returning all articles for a month or week, allow the user to paginate through the results.

3. **Error Handling**: Implement a more comprehensive error handling mechanism to handle various edge cases, rate limiting, and specific Wikipedia API errors.

4. **Rate Limiting**: Implement rate limiting to avoid abuse and ensure fair usage of the service.

5. **Logging**: Implement logging to keep track of all incoming requests, errors, and other important events.

6. **Metrics**: Implement monitoring and metrics to keep track of API usage, slow queries, and system performance.

## Performance Optimization:

1. **Parallelize Requests**: When querying multiple dates, use `Promise.all()` to send requests in parallel rather than sequentially.

2. **Database**: Instead of fetching data from Wikipedia every time, periodically fetch data and store it in a local database. This way, queries can be served directly from the database, which would be much faster.

3. **Compression**: Use compression middleware like `compression` in Express to compress the response data, reducing the amount of data sent over the network.

4. **Optimize Data Processing**: Instead of processing the data every time (like aggregation), pre-process data during off-peak hours and store the results for faster retrieval.
