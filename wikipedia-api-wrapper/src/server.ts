import express, { Request, Response } from 'express';
import axios from 'axios';
import { format, eachDayOfInterval, parse, isValid } from 'date-fns';

const app = express();
const PORT = 3000;
const BASE_WIKIPEDIA_API = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access';

type Article = {
    article: string;
    rank?: number;
    views: number;
};

async function fetchArticleData(date: string) {
    const url = `${BASE_WIKIPEDIA_API}/${date}`;
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Wikipedia-API-Wrapper/1.0'
        }
    });
    return response.data.items[0].articles;
}

app.get('/top-articles/:year/:month/:day?', async (req: Request, res: Response) => {
    try {
        const { year, month, day } = req.params;
        const { duration } = req.query;

        if (!day) {
            return res.status(400).json({ error: "Day parameter is missing." });
        }

        if (['week', 'month'].indexOf(duration as string) === -1) {
            return res.status(400).json({ error: "Invalid duration. Please select either 'week' or 'month'." });
        }

        const dateStr = `${year}/${month}/${day}`;
        const parsedDate = parse(dateStr, 'yyyy/MM/dd', new Date());

        if (!isValid(parsedDate)) {
            return res.status(400).json({ error: "Invalid date provided." });
        }

        const startDate = parsedDate;
        let endDate;

        if (duration === 'week') {
            endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days added to the start date
        } else {
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // End of the month
        }

        const days = eachDayOfInterval({
            start: startDate,
            end: endDate
        });

        const dataPromises = days.map(day => fetchArticleData(format(day, 'yyyy/MM/dd')));

        const dataForDuration = await Promise.all(dataPromises);

        const aggregatedData: any = {};

        for (const dayData of dataForDuration) {
            for (const article of dayData) {
                if (!aggregatedData[article.article]) {
                    aggregatedData[article.article] = 0;
                }
                aggregatedData[article.article] += article.views;
            }
        }

        // Convert aggregated data to an array and sort by views
        const sortedData: Article[] = Object.entries(aggregatedData)
            .map(([article, views]): Article => ({ article, views: views as number }))
            .sort((a: Article, b: Article) => b.views - a.views);

        res.json(sortedData);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            // This confirms that the error is an Axios error, and thus should have a `message` property
            res.status(500).send({ error: error.message });
        } else {
            res.status(500).send({ error: 'An unknown error occurred.' });
        }
    }
});

app.get('/article-views/:year/:month/:day', async (req: Request, res: Response) => {
    try {
        const { year, month, day } = req.params;
        const { title, duration } = req.query;

        if (!title) {
            return res.status(400).json({ error: "Article title is required." });
        }

        if (['week', 'month'].indexOf(duration as string) === -1) {
            return res.status(400).json({ error: "Invalid duration. Please select either 'week' or 'month'." });
        }

        const dateStr = `${year}/${month}/${day}`;
        const parsedDate = parse(dateStr, 'yyyy/MM/dd', new Date());

        if (!isValid(parsedDate)) {
            return res.status(400).json({ error: "Invalid date provided." });
        }

        const startDate = parsedDate;
        let endDate;

        if (duration === 'week') {
            endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
        } else {
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        }

        const days = eachDayOfInterval({
            start: startDate,
            end: endDate
        });

        const dataPromises = days.map(day => fetchArticleData(format(day, 'yyyy/MM/dd')));

        const dataForDuration = await Promise.all(dataPromises);
        console.log(dataForDuration)

        let totalViews = 0;

        for (const dayData of dataForDuration) {
            const articleData = dayData.find((article: Article) => article.article === title);
            if (articleData) {
                totalViews += articleData.views;
            }
        }

        res.json({ title, totalViews });

    } catch (error) {
        if (axios.isAxiosError(error)) {
            res.status(500).send({ error: error.message });
        } else {
            res.status(500).send({ error: 'An unknown error occurred.' });
        }
    }
});

app.get('/max-views-day/:year/:month', async (req: Request, res: Response) => {
    try {
        const { year, month } = req.params;
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({ error: "Article title is required." });
        }

        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0); // last day of the month

        const days = eachDayOfInterval({
            start: startDate,
            end: endDate
        });

        const dataPromises = days.map(day => fetchArticleData(format(day, 'yyyy/MM/dd')));

        const dataForMonth = await Promise.all(dataPromises);

        let maxViews = 0;
        let maxViewDate;

        for (let i = 0; i < dataForMonth.length; i++) {
            const dayData = dataForMonth[i];
            const articleData = dayData.find((article: Article) => article.article === title);

            if (articleData && articleData.views > maxViews) {
                maxViews = articleData.views;
                maxViewDate = days[i];
            }
        }

        if (maxViewDate) {
            res.json({ title, mostViewsDate: format(maxViewDate, 'yyyy/MM/dd'), views: maxViews });
        } else {
            res.status(404).json({ error: `No data found for the article titled "${title}" in ${month}-${year}.` });
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            res.status(500).send({ error: error.message });
        } else {
            res.status(500).send({ error: 'An unknown error occurred.' });
        }
    }
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
