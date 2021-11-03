import fetch, { RequestInfo } from 'node-fetch';

function partitionArray<T>(array: readonly T[], partitionSize: number): readonly T[][] {
	const workingCopy: T[] = [...array];
	const result: T[][] = [];
	while (workingCopy.length) {
		result.push(workingCopy.splice(0, partitionSize));
	}
	return result;
}

async function http(request: RequestInfo): Promise<any> {
	return new Promise((resolve) => {
		fetch(request)
			.then(
				(response) => {
					return response.text();
				},
				(error) => {
					console.warn('could not retrieve review', error);
				},
			)
			.then((body) => {
				resolve(body);
			});
	});
}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const groupByFunction = <T>(keyExtractor: (obj: T) => string | number) => (array: readonly T[]): { [key: string]: readonly T[] } => {
	return array.reduce((objectsByKeyValue, obj) => {
		const value = keyExtractor(obj);
		objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
		return objectsByKeyValue;
	}, {});
};

export { partitionArray, http, sleep };

export const pickRandom = <T>(array: readonly T[]): T => {
	if (!array?.length) {
		return null;
	}
	return array[Math.floor(Math.random() * array.length)];
};
