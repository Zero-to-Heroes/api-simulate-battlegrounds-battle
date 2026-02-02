import { BoardEnchantment } from '../board-entity';
import { CardIds } from '../services/card-ids';

const MAX_LEAPFROGGER_GROUPS = 12;

export const groupLeapfroggerDeathrattles = (rememberedDeathrattles: BoardEnchantment[]): BoardEnchantment[] => {
	const candidates = rememberedDeathrattles
		.filter((deathrattle) => deathrattle.cardId?.startsWith(CardIds.Leapfrogger_BG21_000))
		.map((d) => {
			if (!d.cardId.endsWith('e')) {
				return { ...d, cardId: `${d.cardId}e` };
			}
			return d;
		});
	const normalGroups = groupDeathrattles(
		candidates.filter((d) => d.cardId === CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e),
	);
	const goldenGroups = groupDeathrattles(
		candidates.filter((d) => d.cardId === CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge),
	);
	return [...normalGroups, ...goldenGroups];
};

const groupDeathrattles = (candidates: BoardEnchantment[]): BoardEnchantment[] => {
	const totalRepeats = candidates.reduce((acc, next) => acc + next.repeats, 0);
	if (totalRepeats <= MAX_LEAPFROGGER_GROUPS) {
		return candidates;
	}

	const result: BoardEnchantment[] = [];
	const repeatsPerGroup = Math.ceil(totalRepeats / MAX_LEAPFROGGER_GROUPS);
	let repeatsLeft = totalRepeats;
	for (let i = 0; i < MAX_LEAPFROGGER_GROUPS; i++) {
		const groupRepeats = Math.min(repeatsPerGroup, repeatsLeft);
		result.push({ ...candidates[0], repeats: groupRepeats });
		repeatsLeft -= groupRepeats;
	}
	return result;
};
