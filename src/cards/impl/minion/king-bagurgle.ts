import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

const baseAttackBuff = 3;
const baseHealthBuff = 4;

export const KingBagurgle: BattlecryCard = {
	cardIds: [CardIds.KingBagurgle_BGS_030, CardIds.KingBagurgle_TB_BaconUps_100],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.KingBagurgle_BGS_030 ? 1 : 2;
		const targets = input.board
			.filter((e) => e.entityId !== minion.entityId)
			.filter((e) => hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.allCards));
		for (const entity of targets) {
			modifyStats(entity, baseAttackBuff * mult, baseHealthBuff * mult, input.board, input.hero, input.gameState);
		}
	},
};
