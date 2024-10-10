import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const ArtisanalUrn = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const artisanalUrnBuff = trinket.cardId === CardIds.ArtisanalUrn_BG30_MagicItem_989 ? 3 : 8;
		input.playerEntity.globalInfo.UndeadAttackBonus =
			(input.playerEntity.globalInfo.UndeadAttackBonus ?? 0) + artisanalUrnBuff;
		return true;
	},
};
