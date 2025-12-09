import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const NalaaTheRedeemer: OnTavernSpellCastCard = {
	cardIds: [CardIds.NalaaTheRedeemer_BG28_551, CardIds.NalaaTheRedeemer_BG28_551_G],
	onTavernSpellCast: (minion: BoardEntity, input: CastSpellInput) => {
		const mult = minion.cardId === CardIds.NalaaTheRedeemer_BG28_551_G ? 2 : 1;
		grantStatsToMinionsOfEachType(minion, input.board, input.hero, 3 * mult, 2 * mult, input.gameState);
	},
};
