import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const TimewarpedChimera: OnDamagedCard = {
	cardIds: [CardIds.TimewarpedChimera_BG34_Giant_679, CardIds.TimewarpedChimera_BG34_Giant_679_G],
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === CardIds.TimewarpedChimera_BG34_Giant_679_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			grantStatsToMinionsOfEachType(minion, input.board, input.hero, 2, 1, input.gameState);
		}
		return true;
	},
};
