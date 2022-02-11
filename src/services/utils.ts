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

export const encode = (input: string): string => {
	// return compressToEncodedURIComponent(input);
	const buff = Buffer.from(input, 'utf-8');
	const base64 = buff.toString('base64');
	return base64;
};

export const decode = (base64: string): string => {
	const buff = Buffer.from(base64, 'base64');
	const str = buff.toString('utf-8');
	return str;
};

export const pickMultipleRandomDifferent = <T>(list: T[], n: number): T[] => {
	const shuffled = shuffleArray([...list]);
	return shuffled.slice(0, n);
};

// https://stackoverflow.com/a/2450976/548701
export const shuffleArray = <T>(array: T[]): T[] => {
	let currentIndex = array.length;
	let randomIndex = 0;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
};
