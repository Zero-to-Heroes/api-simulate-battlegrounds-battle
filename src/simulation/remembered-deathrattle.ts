import { CardIds } from '@firestone-hs/reference-data';

const MAX_LEAPFROGGER_GROUPS = 12;

export const groupLeapfroggerDeathrattles = (
	rememberedDeathrattles: { cardId: string; timing: number; repeats: number }[],
): { cardId: string; timing: number; repeats: number }[] => {
	const candidates = rememberedDeathrattles
		.filter((deathrattle) => deathrattle.cardId?.startsWith(CardIds.Leapfrogger_BG21_000))
		.map((d) => {
			if (d.cardId.endsWith('e')) {
				return { ...d, cardId: d.cardId.slice(0, -1) };
			}
			return d;
		});
	const normalGroups = groupDeathrattles(candidates.filter((d) => d.cardId === CardIds.Leapfrogger_BG21_000));
	const goldenGroups = groupDeathrattles(candidates.filter((d) => d.cardId === CardIds.Leapfrogger_BG21_000_G));
	return [...normalGroups, ...goldenGroups];
};

const groupDeathrattles = (
	candidates: { cardId: string; timing: number; repeats: number }[],
): { cardId: string; timing: number; repeats: number }[] => {
	const totalRepeats = candidates.reduce((acc, next) => acc + next.repeats, 0);
	if (totalRepeats <= MAX_LEAPFROGGER_GROUPS) {
		return candidates;
	}

	const result: { cardId: string; timing: number; repeats: number }[] = [];
	const repeatsPerGroup = Math.ceil(totalRepeats / MAX_LEAPFROGGER_GROUPS);
	let repeatsLeft = totalRepeats;
	for (let i = 0; i < MAX_LEAPFROGGER_GROUPS; i++) {
		const groupRepeats = Math.min(repeatsPerGroup, repeatsLeft);
		result.push({ ...candidates[0], repeats: groupRepeats });
		repeatsLeft -= groupRepeats;
	}
	return result;
};
