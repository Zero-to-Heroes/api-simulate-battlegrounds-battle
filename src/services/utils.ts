import { BoardEntity } from '../board-entity';

function partitionArray<T>(array: readonly T[], partitionSize: number): readonly T[][] {
	const workingCopy: T[] = [...array];
	const result: T[][] = [];
	while (workingCopy.length) {
		result.push(workingCopy.splice(0, partitionSize));
	}
	return result;
}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const groupByFunction =
	<T>(keyExtractor: (obj: T) => string | number) =>
	(array: readonly T[]): { [key: string]: readonly T[] } => {
		return (array ?? []).reduce((objectsByKeyValue, obj) => {
			const value = keyExtractor(obj);
			objectsByKeyValue[value] = objectsByKeyValue[value] ?? [];
			// Using push instead of concat is thousands of times faster on big arrays
			objectsByKeyValue[value].push(obj);
			return objectsByKeyValue;
		}, {});
	};

export { partitionArray, sleep };

export const pickRandom = <T>(array: readonly T[]): T => {
	if (!array?.length) {
		return null;
	}
	return array[Math.floor(Math.random() * array.length)];
};

export const pickRandomAlive = (board: BoardEntity[]): BoardEntity => {
	const targetBoard = board.filter((e) => e.health > 0 && !e.definitelyDead);
	const chosenEntity = pickRandom(targetBoard);
	return chosenEntity;
};

export const pickMultipleRandomAlive = (board: BoardEntity[], quantity: number): BoardEntity[] => {
	const picked: BoardEntity[] = [];
	for (let i = 0; i < quantity; i++) {
		const targetBoard = board.filter((e) => e.health > 0 && !e.definitelyDead).filter((e) => !picked.includes(e));
		const chosenEntity = pickRandom(targetBoard);
		if (!!chosenEntity) {
			picked.push(chosenEntity);
		}
	}
	return picked;
};

export const pickRandomLowestHealth = (board: BoardEntity[]): BoardEntity => {
	const targetBoard = board.filter((e) => e.health > 0 && !e.definitelyDead);
	const lowestHealth = Math.min(...targetBoard.map((e) => e.health));
	const entitiesWithLowestHealth = targetBoard.filter((e) => e.health === lowestHealth);
	const chosenEntity = pickRandom(entitiesWithLowestHealth);
	return chosenEntity;
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
